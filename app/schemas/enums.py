from enum import Enum

class Unit(str, Enum):
    KG = "KG"
    EACH = "EACH"
    BAG = "BAG"
    PACK = "PACK"
    TRAY = "TRAY"
    BOX = "BOX"
    BOTTLE = "BOTTLE"
    CAN = "CAN"
    LOAF = "LOAF"