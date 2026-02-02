# ui.py

from flask import Flask, request, render_template, render_template_string, jsonify, make_response, abort, send_file
from werkzeug.utils import secure_filename
from excelMaker import create_workbook
from data_handler import get_data  # Import the data handler
import fitz
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from conversor import getEquivalents, getAWSData, forceUpdateFlexusOptions, forceUpdateHuaweiOptions, getGeneralEquivalents
from jsCodeGenerator import jsCodeGenerator
import uuid
import os
import io
import math
import re

app = Flask(__name__)

instances = [{"id": 0, "filename": "input.pdf", "startPage": 0, "startY": 650, "endPage": 3, "endY": 470, "region": "la-sao paulo1", "data": []}]

@app.route('/')
def mainPage():
    print(instances)
    return render_template("index.html")

@app.route('/file-recieve')
def fileRecieve():
    return render_template("fileRecieve.html")


@app.route('/file-recieve', methods=['POST'])
def upload_file():
    global pdfName
    global pageHeight

    if 'file' not in request.files:
        return 'No file part'
    
    file = request.files['file']
    
    if file.filename == '':
        return 'No selected file'
    
    if file and file.filename.endswith(".pdf"):
        filename = file.filename
        # Generate a unique UUID
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        pdfName = unique_filename
        
        # Save the file with the new name
        file_path = os.path.join("static/pdfs", unique_filename)
        file.save(file_path)
        
        # Open the PDF to get its height
        doc = fitz.open(file_path)
        page1 = doc[0]
        pageHeight = page1.rect.height
        print(pageHeight)
        
        id = len(instances)
        instances.append({"id": id, "filename": unique_filename, "startPage": -1, "startY": -1, "endPage": -1, "endY": -1, "data": {}})

        resp = make_response(render_template("success.html"))
        resp.set_cookie('currentID', str(id), max_age=86400)
        return resp 
    else:
        return 'Invalid file type'

@app.route('/select-positions')
def selectPositions():
    id = int(request.cookies.get("currentID"))
    return render_template("selectPositions.html", filename=instances[id]["filename"])

@app.route('/select-positions', methods=['POST'])
def selectPositionsForm():
    startPage = int(request.form.get("startingPage")) - 1
    startY = int(request.form.get("startingY"))
    endPage = int(request.form.get("endingPage")) - 1
    endY = int(request.form.get("endingY"))

    print(startPage, startY, endPage, endY)

    id = int(request.cookies.get("currentID"))

    instances[id]["startPage"] = startPage
    instances[id]["startY"] = startY
    instances[id]["endPage"] = endPage
    instances[id]["endY"] = endY

    return render_template("success.html")

@app.route('/select-region')
def selectRegion():
    return render_template("selectRegion.html")

@app.route('/select-region', methods=['POST'])
def selectRegionForm():
    id = int(request.cookies.get("currentID"))
    
    region = request.form.get("region")
    instances[id]["region"] = region

    return render_template("success.html")

@app.route('/refresh-region', methods=['POST'])
def refreshRegion():
    data = request.get_json()
    region = data.get("region")

    forceUpdateHuaweiOptions(region)
    forceUpdateFlexusOptions(region)

    return jsonify({"ok": "ok"})


@app.route("/get-data")
def runData():
    id = int(request.cookies.get("currentID"))

    data = get_data(instances[id]["startPage"], instances[id]["startY"], instances[id]["endPage"], instances[id]["endY"])
    
    instances[id]["data"] = data

    return jsonify({"ok": "ok"})

@app.route("/select-ecs")
def selectECS():
    id = int(request.cookies.get("currentID"))

    if instances[id]["data"][0].get("flavor", "").startswith("nAWS"):
        ecsData = list(filter(lambda x: x["kind"] == "ecs", instances[id]["data"]))
        flavors = instances[id]["data"]
        optionsArr = list(map(lambda x: getGeneralEquivalents(x["vcpus"], x["memory"], instances[id]["region"]), ecsData))

        optionsObj = {}
        for i in range(len(flavors)):
            optionsObj[flavors[i]["name"]] = optionsArr[i]

        return render_template('selectECS2.html', data=optionsObj, flavors=flavors)

    ecsData = list(filter(lambda x: x["kind"] == "ecs", instances[id]["data"]))
    flavors = [getAWSData(y["type"]) for y in list(filter(lambda x: x["kind"] == "ecs", instances[id]["data"]))]
    optionsArr = list(map(lambda x: getEquivalents(x["type"], instances[id]["region"]), ecsData))
    optionsObj = {}
    for i in range(len(flavors)):
        optionsObj[flavors[i]["name"]] = optionsArr[i]

        
    return render_template('selectECS.html', data=optionsObj, flavors=flavors)

@app.route('/select-ecs', methods=['POST'])
def selectECSForm():
    id = int(request.cookies.get("currentID"))

    selected_flavors = {}
    flavors = [getAWSData(y["type"]) for y in list(filter(lambda x: x["kind"] == "ecs", instances[id]["data"]))]
    for flavor in flavors:
        flavor_name = flavor["name"]
        selected_flavors[flavor_name] = request.form.get(f"flavor_{flavor_name}")
    
    # Process the data (you can save it to a database, etc.)
    print(selected_flavors)
    print(list(selected_flavors.keys()))

    for instance in instances[id]["data"]:
        if instance["type"] in list(selected_flavors.keys()):
            instance["type"] = selected_flavors[instance["type"]]

    i = 0
    while i < len(instances[id]["data"]):
        current_flavor = instances[id]["data"][i]
        j = i + 1
        while j < len(instances[id]["data"]):
            if instances[id]["data"][j]["type"] == current_flavor["type"]:
                current_flavor["usage"] += instances[id]["data"][j]["usage"]
                instances[id]["data"].pop(j)
            else:
                j += 1
        i += 1
    
    return render_template("success.html")

@app.route('/select-ecs2', methods=['POST'])
def selectECSForm2():
    id = int(request.cookies.get("currentID"))

    selected_flavors = {}
    flavors = list(filter(lambda x: x["kind"] == "ecs", instances[id]["data"]))
    for flavor in flavors:
        flavor_name = flavor["name"]
        selected_flavors[flavor_name] = request.form.get(f"flavor_{flavor_name}")
    
    # Process the data (you can save it to a database, etc.)
    print(selected_flavors)
    print(list(selected_flavors.keys()))

    for instance in instances[id]["data"]:
        if instance["type"] in list(selected_flavors.keys()):
            instance["type"] = selected_flavors[instance["type"]]

    i = 0
    while i < len(instances[id]["data"]):
        current_flavor = instances[id]["data"][i]
        j = i + 1
        while j < len(instances[id]["data"]):
            if instances[id]["data"][j]["type"] == current_flavor["type"]:
                current_flavor["usage"] += instances[id]["data"][j]["usage"]
                instances[id]["data"].pop(j)
            else:
                j += 1
        i += 1
    
    return render_template("success.html")


@app.route('/table')
def table():
    id = int(request.cookies.get("currentID"))

    filename = instances[id]["filename"]
    pdf_path = os.path.join("static/pdfs", filename)
    if os.path.isfile(pdf_path):
        try:
            os.remove(pdf_path)
            app.logger.debug(f"Deleted uploaded PDF: {pdf_path}")
        except Exception as e:
            app.logger.error(f"Error deleting PDF {pdf_path}: {e}")
    
    dataSrc = instances[id]["data"]

    for row in dataSrc:
        if "usage" in row and row["usage"] is not None:
            row["usage"] = math.ceil(row["usage"])

        if "requests" in row and row["requests"] is not None:
            row["requests"] = math.ceil(row["requests"])
        
    return render_template('table.html', data=dataSrc)

@app.route('/getJS')
def getJS():
    id = int(request.cookies.get("currentID"))

    dataSrc = instances[id]["data"]

    region = request.args.get("region")
    return jsonify({"code": jsCodeGenerator(dataSrc, region)})

@app.route('/manual-specs')
def getManualSpecs():
    return render_template('manualSpecs.html')

@app.route('/manual-specs', methods=['POST'])
def receive_manual_specs():
    message = request.form.get("message", "")

    numbers = re.findall(r'\d+(?:\.\d+)?', message)

    specs = []
    for i in range(0, len(numbers) - 2, 3):
        specs.append({
            "flavor": "nAWS" + str(i),
            "vcpus": int(numbers[i]),
            "memory": int(numbers[i + 1]),
            "usage": int(numbers[i + 2]),
            "family": "nAWS" + str(i),
            "name": "nAWS" + str(i),
            "kind": "ecs",
            "type": "nAWS" + str(i)
        })

    id = len(instances)
    instances.append({
        "id": id,
        "filename": "N/A",
        "startPage": -1,
        "startY": -1,
        "endPage": -1,
        "endY": -1,
        "data": specs
    })

    resp = make_response(render_template("success.html"))
    resp.set_cookie('currentID', str(id), max_age=86400)
    return resp

@app.route('/excel-maker')
def getExcelMaker():
    return render_template('excelMaker.html')

@app.route('/excel-maker', methods=['POST'])
def postExcelMaker():
    files  = request.files.getlist('files[]')
    names  = request.form.getlist('names[]')

    if not files or not names or len(files) != len(names):
        abort(400, "files[] and names[] must both be present and of equal length.")

    for f in files:
        filename = f.filename or ""
        if not filename.lower().endswith('.xlsx'):
            abort(400, f"Invalid file type: {secure_filename(filename)}. Only .xlsx allowed.")

    output = create_workbook(files, names)

    return send_file(
        output,
        as_attachment=True,
        download_name="processed_data.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
