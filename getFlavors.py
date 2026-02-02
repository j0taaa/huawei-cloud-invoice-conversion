import requests
import json
import re
from requests.exceptions import HTTPError

def extractNumbers(input_string):
    nums = re.findall(r"\d+\.?\d*", input_string)
    parsed = []
    for n in nums:
        parsed.append(float(n) if '.' in n else int(n))
    return parsed


def getFirstNumber(s):
    numbers = extractNumbers(s)
    return numbers[0] if numbers else None


def getJsonPage(url):
    resp = requests.get(url)
    resp.raise_for_status()
    try:
        return resp.json()
    except ValueError:
        text = resp.text
        start = text.find('{')
        end = text.rfind('}') + 1
        return json.loads(text[start:end])


def gatherHuaweiOptions(region, filterRI=True):
    url = (
        "http://portal-intl.huaweicloud.com/api/calculator/rest/"
        "cbc/portalcalculatornodeservice/v4/api/productInfo"
        f"?urlPath=ecs&tag=general.online.portal&region={region}&tab=calc&sign=common"
    )
    data = getJsonPage(url)
    products = data.get("product", {}).get("ec2_vm", [])
    if filterRI:
        products = [p for p in products if any(plan.get("billingMode") == "RI" for plan in p.get("planList", []))]
    options = []
    for p in products:
        options.append({
            "flavor": p.get("resourceSpecCode"),
            "vCPUs": getFirstNumber(p.get("cpu", "")),
            "memory": getFirstNumber(p.get("mem", "")),
            "family": p.get("performType")
        })
    return sorted(options, key=lambda x: (x.get("vCPUs"), x.get("memory")))


def getFlexusOptions(region):
    url = (
        "https://portal-intl.huaweicloud.com/api/calculator/rest/"
        "cbc/portalcalculatornodeservice/v4/api/productInfo"
        f"?urlPath=hecs&tag=general.online.portal&region={region}&tab=calc&sign=common"
    )
    data = getJsonPage(url)
    products = data.get("product", {}).get("ec2_vm", [])
    options = []
    for p in products:
        options.append({
            "flavor": p.get("resourceSpecCode"),
            "vCPUs": getFirstNumber(p.get("cpu", "")),
            "memory": getFirstNumber(p.get("mem", "")),
            "family": p.get("performType")
        })
    return sorted(options, key=lambda x: (x.get("vCPUs"), x.get("memory")))

def getFormattedFlexusOptions(region):
    raw = getFlexusOptions(region)
    grouped = {}
    for o in raw:
        v = o.get("vCPUs")
        mem = o.get("memory")
        grouped.setdefault(v, set()).add(mem)
    return [{"vCPUs": v, "memoryOptions": sorted(grouped[v])} for v in sorted(grouped)]


def getAWSOptions():
    region_label = "US East (N. Virginia)"
    region_url = region_label.replace(' ', '%20').replace('(', '%28').replace(')', '%29')
    base = (
        "https://calculator.aws/pricing/2.0/meteredUnitMaps/ec2/USD/current/"
        f"ec2-calc/{region_url}"
    )
    urls = []
    # On-Demand with license options
    license_opts = ["No", "Yes"]
    for lic in license_opts:
        urls.append(
            f"{base}/OnDemand/Shared/Linux/NA/No%20License%20required/{lic}/index.json"
        )
    # Reserved
    terms = ["1yr", "3yr"]
    upfronts = ["All%20Upfront", "No%20Upfront", "Partial%20Upfront"]
    instances = ["convertible", "standard"]
    for term in terms:
        for upfront in upfronts:
            for inst in instances:
                for lic in license_opts:
                    urls.append(
                        f"{base}/Reserved/Shared/Linux/NA/No%20License%20required/"
                        f"{term}/{upfront}/{inst}/{lic}/index.json"
                    )
    all_data = {}
    for url in urls:
        try:
            page = getJsonPage(url)
            region_data = page.get("regions", {}).get(region_label, {})
            all_data.update(region_data)
        except HTTPError as e:
            # skip missing endpoints
            continue
    aws_options = {}
    for v in all_data.values():
        mem = getFirstNumber(v.get("Memory", "")) or 0
        aws_options[v.get("Instance Type")] = {
            "vCPUs": int(v.get("vCPU", 0)),
            "Memory": mem,
            "Network Performance": v.get("Network Performance"),
            "Storage": v.get("Storage")
        }
    return aws_options
