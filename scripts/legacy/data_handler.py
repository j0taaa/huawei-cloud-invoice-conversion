import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
import math


def get_data(startPage, startY, endPage, endY, input_pdf="input.pdf"):
    zoom = 5

    typesXs = {"x1":25, "x2":342}
    usageXs = {"x1":345, "x2":455}

    flavorPattern = r'^[a-z]+\d+[a-z]*\.(nano|micro|small|medium|large|xlarge|2xlarge|3xlarge|4xlarge|5xlarge|metal)$'


    def crop_until_O_or_number(text):
        for i in range(len(text) -1, -1, -1):
            if text[i] == 'O' or text[i].isdigit():
                return text[:i+1]
        return ''

    def printPart(input_pdf, pIndex, coords):
        mat = fitz.Matrix(zoom, zoom)

        doc = fitz.open(input_pdf)
        page = doc[pIndex]
        rect = page.rect

        x1 = coords["x1"]
        x2 = coords["x2"]
        y1 = coords["y1"]
        y2 = coords["y2"]

        if x1 == -1:
            x1 = rect.x0
        if x2 == -1:
            x2 = rect.x1
        if y1 == -1:
            y1 = rect.y0
        if y2 == -1:
            y2 = rect.y1

        crop_rect = fitz.Rect(x1, y1, x2, y2)

        page.set_cropbox(crop_rect)

        pix = page.get_pixmap(matrix=mat)
        img = Image.open(io.BytesIO(pix.tobytes("png")))

        return img

    def checkExistanceText(text, sentences):
        for sentence in sentences:
            if sentence in text:
                return sentence
        return text

    def getImportant(text):
        words = text.split(" ")

        for i in range(len(words)):
            if words[i] == "Instance" or words[i] == "instance-hour":
                return words[i-1]
            if words[i] == "(gp2)":
                return "General Purpose SSD"
            if words[i] == "(gp3)":
                return "General Purpose Storage"
            
        sentence = checkExistanceText(text.lower(), ["data transfer to", "data transfer from", "data transfer in", "data transfer out", "snapshot data stored", "magnetic provisioned storage", "requests"])
        
        if sentence != text.lower():
            return sentence
        
        return text

    def isNotImportant(text):
        excludedSentences = ["data transfer from", "data transfer in", "IPv4", "per LoadBalancer-hour", "Hosted Zone", "Granular Cost Data"]

        for sentence in excludedSentences:
            if sentence in text: 
                return True
        return False

    doc = fitz.open(input_pdf)

    fullTxt = ""
    types = []
    usage = []


    index = startPage

    imgTypes = printPart(input_pdf, index, {"x1":typesXs["x1"], "y1":startY, "x2":typesXs["x2"], "y2":-1})
    textTypes = pytesseract.image_to_string(imgTypes)

    imgUsage = printPart(input_pdf, index, {"x1":usageXs["x1"], "y1":startY, "x2":usageXs["x2"], "y2":-1})
    textUsage = pytesseract.image_to_string(imgUsage)

    index+=1

    while index < endPage:
        imgTypes = printPart(input_pdf, index, {"x1":typesXs["x1"], "y1":13, "x2":typesXs["x2"], "y2":-1})
        textTypes += pytesseract.image_to_string(imgTypes)

        imgUsage = printPart(input_pdf, index, {"x1":usageXs["x1"], "y1":13, "x2":usageXs["x2"], "y2":-1})
        textUsage += pytesseract.image_to_string(imgUsage)

        index+=1

    imgTypes = printPart(input_pdf, index, {"x1":typesXs["x1"], "y1":13, "x2":typesXs["x2"], "y2":endY})
    textTypes += pytesseract.image_to_string(imgTypes)

    imgUsage = printPart(input_pdf, index, {"x1":usageXs["x1"], "y1":13, "x2":usageXs["x2"], "y2":endY})
    textUsage += pytesseract.image_to_string(imgUsage)

    lines = fullTxt.split("\n")

    textTypes = textTypes.split("\n")
    textTypes = list(filter(lambda line: line.startswith("$") or line.startswith("USD") or line.startswith("First "), textTypes))

    textUsage = textUsage.split("\n")
    textUsage = list(filter(lambda line: len(line) > 1, textUsage))
    textUsage = list(filter(lambda line: line!="month", textUsage))

    mode = 0

    allInfo = []
    for i in range(len(textUsage)):
        unit = "nn"
        textUsage[i] = textUsage[i].upper()

        if textUsage[i].endswith("GB") or textUsage[i].endswith("GIGABYTES"):
            unit = "GB"
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("HRS"):
            unit = "hrs"
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("MINUTES"):
            unit = "min"
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("REQUESTS"):
            unit = "requests"
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("USAGERECORD") or textUsage[i].endswith("USAGERECORD-"):
            unit = "usagerecords"
            textUsage[i] = textUsage[i][:-11]
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("HOSTEDZONE"):
            unit = "hostedzones"
            textUsage[i] = textUsage[i][:-10]
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("GB-MO") or textUsage[i].endswith("GB-MO."):
            unit = "GB-Mo"
            textUsage[i] = textUsage[i][:-4]
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        if textUsage[i].endswith("BUCKET-MO"):
            unit = "Bucket-Mo"
            textUsage[i] = textUsage[i][:-7]
            textUsage[i] = crop_until_O_or_number(textUsage[i])
        
        if unit == "hrs":
            textUsage[i]

        if textUsage[i] == "O":
            textUsage[i] = "0"
        
        textUsage[i] = textUsage[i].replace(".", "")
        textUsage[i] = textUsage[i].replace(",", ".")

        if float(textUsage[i]) < 1:
            continue 


        textTypes[i] = getImportant(textTypes[i])

        if isNotImportant(textTypes[i]):
            continue

        allInfo.append({"type": textTypes[i], "usage": float(textUsage[i]), "unit": unit})


    services = []

    for info in allInfo:
        if re.search(flavorPattern, info["type"]):
            if not any(service["type"] == info["type"] for service in services):
                services.append({"type": info["type"], "kind": "ecs", "usage": math.ceil(info["usage"]/744)})
            else:
                index = [i for i, service in enumerate(services) if service["type"] == info["type"]][0]
                services[index]["usage"] += math.ceil(info["usage"]/744)

        elif info["type"] in ["General Purpose Storage", "magnetic provisioned storage"] or "first 50 TB" in info["type"]:
            if not any(service["type"] == "HighIO" for service in services):
                services.append({"type": "HighIO", "kind": "evs", "usage": 0})
            index = [i for i, service in enumerate(services) if service["type"] == "HighIO"][0]
            services[index]["usage"] += info["usage"]
        
        elif info["type"] in ["General Purpose SSD"]:
            if not any(service["type"] == "SSD" for service in services):
                services.append({"type": "SSD", "kind": "evs", "usage": 0})
            index = [i for i, service in enumerate(services) if service["type"] == "SSD"][0]
            services[index]["usage"] += info["usage"]
        elif "month of storage used" in info["type"] or info["type"] in ["snapshot data stored", "requests"]:
            if not any(service["type"] == "obs" for service in services):
                services.append({"type": "obs", "kind": "obs", "usage": 0, "requests": 0})
            index = [i for i, service in enumerate(services) if service["type"] == "obs"][0]
            if info["type"] == "requests":
                services[index]["requests"] += info["usage"]
            else:
                services[index]["usage"] += info["usage"]
        elif info["type"] in ["data transfer to", "data transfer out"]:
            if not any(service["type"] == "eip" for service in services):
                services.append({"type": "eip", "kind": "eip", "usage": 0})
            index = [i for i, service in enumerate(services) if service["type"] == "eip"][0]
            services[index]["usage"] += info["usage"]
        elif "loadbalancer" in (info["type"].replace(" ", "").lower()):
            if not any(service["type"] == "elb" for service in services):
                services.append({"type": "elb", "kind": "elb", "usage": 0})
            index = [i for i, service in enumerate(services) if service["type"] == "elb"][0]
            services[index]["usage"] += info["usage"]
        else:
            if not any(service["type"] == "N/A" for service in services):
                services.append({"type": "N/A", "kind": "N/A", "list": []})
            index = [i for i, service in enumerate(services) if service["type"] == "N/A"][0]
            if "build minute" in info["type"]:
                services[index]["list"].append("AWS Amplify")
            else:
                services[index]["list"].append(info["type"])
    with open("output.txt", "w") as file:
        for info in allInfo:
            file.write(info["type"])
            file.write(" - ")
            file.write(str(info["usage"]))
            file.write(" - ")
            file.write(info["unit"])
            file.write("\n")

    return services
