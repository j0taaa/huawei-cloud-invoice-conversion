import json
import sys
from pathlib import Path

LEGACY_DIR = Path(__file__).resolve().parent / "legacy"
sys.path.insert(0, str(LEGACY_DIR))

from conversor import (
    getAWSData,
    getEquivalents,
    getGeneralEquivalents,
    forceUpdateFlexusOptions,
    forceUpdateHuaweiOptions,
)
from data_handler import get_data
from jsCodeGenerator import jsCodeGenerator


def _load_payload(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _write_output(payload: dict) -> None:
    print(json.dumps(payload))


def handle_extract_data(payload: dict) -> None:
    data = get_data(
        payload["startPage"],
        payload["startY"],
        payload["endPage"],
        payload["endY"],
        payload["file"],
    )
    _write_output({"data": data})


def handle_ecs_options(payload: dict) -> None:
    data = payload.get("data", [])
    region = payload["region"]
    ecs_data = [item for item in data if item.get("kind") == "ecs"]

    mode = "aws"
    if ecs_data and str(ecs_data[0].get("flavor", "")).startswith("nAWS"):
        mode = "manual"

    options = []
    for item in ecs_data:
        if mode == "manual":
            opts = getGeneralEquivalents(item["vcpus"], item["memory"], region)
            name = item.get("name") or item.get("flavor")
            options.append(
                {
                    "name": name,
                    "vcpus": item["vcpus"],
                    "memory": item["memory"],
                    "options": opts,
                }
            )
        else:
            aws_data = getAWSData(item["type"])
            opts = getEquivalents(item["type"], region)
            options.append(
                {
                    "name": aws_data["name"],
                    "vcpus": aws_data["vCPUs"],
                    "memory": aws_data["Memory"],
                    "options": opts,
                }
            )

    _write_output({"mode": mode, "options": options})


def handle_js_code(payload: dict) -> None:
    code = jsCodeGenerator(payload.get("data", []), payload["region"])
    _write_output({"code": code})


def handle_refresh_region(payload: dict) -> None:
    region = payload["region"]
    forceUpdateHuaweiOptions(region)
    forceUpdateFlexusOptions(region)
    _write_output({"status": "ok"})


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: legacy_bridge.py <payload.json>")

    payload = _load_payload(sys.argv[1])
    action = payload.get("action")

    if action == "extract-data":
        handle_extract_data(payload)
    elif action == "ecs-options":
        handle_ecs_options(payload)
    elif action == "js-code":
        handle_js_code(payload)
    elif action == "refresh-region":
        handle_refresh_region(payload)
    else:
        raise SystemExit(f"Unknown action: {action}")


if __name__ == "__main__":
    main()
