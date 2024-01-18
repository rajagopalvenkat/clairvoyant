from flask import Flask, json

from os import listdir, path

app = Flask(__name__)

@app.route("/api/v1/<problem>/algorithms", methods=["GET"])
def get_algorithms(problem: str):
    directory = path.join("./problems", problem, "algorithms")
    if not path.exists(directory): return "Problem name not found.", 404
    result = []
    for file in listdir(directory):
        if file.endswith(".js"): result.append(file[:-len(".js")])
    return json.dumps(result)

@app.route("/api/v1/<problem>/cases", methods=["GET"])
def get_cases(problem: str):
    directory = path.join("./problems", problem, "cases")
    if not path.exists(directory): return "Problem name not found.", 404
    result = []
    for file in listdir(directory):
        if file.endswith(".txt"): result.append(file[:-len(".txt")])
    return json.dumps(result)

@app.route("/api/v1/<problem>/algorithms/<algorithm>", methods=["GET"])
def get_algorithm(problem: str, algorithm: str):
    file = path.join("./problems", problem, "algorithms", f"{algorithm}.js")
    if not path.exists(file): return "Problem or algorithm name not found.", 404
    with open(file, "r") as f:
        content = f.readlines()
    return "\n".join(content)

@app.route("/api/v1/<problem>/cases/<case>", methods=["GET"])
def get_case(problem: str, case: str):
    file = path.join("./problems", problem, "cases", f"{case}.txt")
    if not path.exists(file): return "Problem or case name not found.", 404
    with open(file, "r") as f:
        content = f.readlines()
    return "\n".join(content)

if __name__ == '__main__':
    app.run("localhost", 5000)