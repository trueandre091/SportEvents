from flask import jsonify


def get_200(data: dict):
    return jsonify(data), 200

def get_400(message: str):
    return jsonify({"message": message}), 400

def get_404(message: str):
    return jsonify({"message": message}), 404

def get_500(message: str):
    return jsonify({"message": message}), 500
