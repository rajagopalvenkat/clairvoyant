from flask import Flask, json, jsonify

from os import listdir, path

app = Flask(__name__)

def OK(data):
    response = jsonify(data)
    response.status_code = 200
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

def NotFound(data):
    response = jsonify(data)
    response.status_code = 404
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route("/api/v1/<problem>/algorithms", methods=["GET"])
def get_algorithms(problem: str):
    directory = path.join("./problems", problem, "algorithms")
    if not path.exists(directory): return NotFound("Problem name not found.")
    result = []
    for file in listdir(directory):
        if file.endswith(".js"): result.append(file[:-len(".js")])
    return OK(result)

@app.route("/api/v1/<problem>/cases", methods=["GET"])
def get_cases(problem: str):
    directory = path.join("./problems", problem, "cases")
    if not path.exists(directory): return NotFound("Problem name not found.")
    result = []
    for file in listdir(directory):
        if file.endswith(".txt"): result.append(file[:-len(".txt")])
    print(f"returning {json.dumps(result)}")
    return OK(result)

@app.route("/api/v1/<problem>/algorithms/<algorithm>", methods=["GET"])
def get_algorithm(problem: str, algorithm: str):
    file = path.join("./problems", problem, "algorithms", f"{algorithm}.js")
    if not path.exists(file): return NotFound("Problem or algorithm name not found.")
    with open(file, "r") as f:
        content = f.readlines()
    return OK("".join(content))

@app.route("/api/v1/<problem>/cases/<case>", methods=["GET"])
def get_case(problem: str, case: str):
    file = path.join("./problems", problem, "cases", f"{case}.txt")
    if not path.exists(file): return NotFound("Problem or algorithm name not found.")
    with open(file, "r") as f:
        content = f.readlines()
    return OK("".join(content))

if __name__ == '__main__':
    app.run("localhost", 5000)