from pymongo import MongoClient
from .config import Config

class Database:
    client: MongoClient = None

    @staticmethod
    def connect():
        try:
            Database.client = MongoClient(Config.MONGO_URI)
            print("Service Notes connecté à MongoDB !")
        except Exception as e:
            print(f"Erreur Mongo : {e}")

    @staticmethod
    def get_collection():
        if Database.client is None:
            Database.connect()
        return Database.client[Config.DB_NAME][Config.COLLECTION_NAME]