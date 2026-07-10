"""Seed product categories and starter products.

Run with:
    python -m app.seeds.seed_products
"""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Category, Product
from app.schemas.enums import Unit


CATEGORIES = [
    "Fresh Meat",
    "Cooked Meat",
    "Beverages",
    "Bakery",
    "Condiments",
]


PRODUCTS = [
    {"sku": "BEV-SCORE", "name": "Score", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-REBOOST", "name": "Reboost", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-POWERADE", "name": "Powerade", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-COKE-2L", "name": "Coca-Cola 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-COKE-1-5L", "name": "Coca-Cola 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-ORANGE-2L", "name": "Fanta Orange 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-ORANGE-1-5L", "name": "Fanta Orange 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STONEY-2L", "name": "Stoney 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STONEY-1-5L", "name": "Stoney 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-BREAKFAST-BLEND-1-5L", "name": "Breakfast Blend 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-CAPPY-ORANGE-1-5L", "name": "Cappy Orange 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-PINEAPPLE-2L", "name": "Fanta Pineapple 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-GRAPE-2L", "name": "Fanta Grape 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-REFRESH-GINGER-2L", "name": "Refresh Ginger 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-REFRESH-APPLE-2L", "name": "Refresh Apple 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-REFRESH-PINEAPPLE-2L", "name": "Refresh Pineapple 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-REFRESH-COLA-2L", "name": "Refresh Cola 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STILL-WATER-1-5L", "name": "Still Water 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STILL-WATER-500ML", "name": "Still Water 500ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-COKE-CAN-440ML", "name": "Coca-Cola Can 440ml", "category": "Beverages", "unit": Unit.CAN},
    {"sku": "BEV-STONEY-CAN-440ML", "name": "Stoney Can 440ml", "category": "Beverages", "unit": Unit.CAN},
    {"sku": "BEV-FANTA-CAN-440ML", "name": "Fanta Can 440ml", "category": "Beverages", "unit": Unit.CAN},
    {"sku": "BEV-COKE-BOTTLE-440ML", "name": "Coca-Cola Bottle 440ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STONEY-BOTTLE-440ML", "name": "Stoney Bottle 440ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-BOTTLE-440ML", "name": "Fanta Bottle 440ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-COKE-BOTTLE-300ML", "name": "Coca-Cola Bottle 300ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-FANTA-BOTTLE-300ML", "name": "Fanta Bottle 300ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-STONEY-BOTTLE-300ML", "name": "Stoney Bottle 300ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-CAPPY-JUICE-500ML", "name": "Cappy Juice 500ml", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SPARKLING-WATER", "name": "Sparkling Water", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SPARKLING-WATER-APPLE", "name": "Sparkling Water Apple", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SPRITE-2L", "name": "Sprite 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SPRITE-1-5L", "name": "Sprite 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SCHWEPPES-DRY-LEMON", "name": "Schweppes Dry Lemon", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SCHWEPPES-TONIC-WATER", "name": "Schweppes Tonic Water", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-LEMON-TWIST-2L", "name": "Lemon Twist 2L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-LEMON-TWIST-1-5L", "name": "Lemon Twist 1.5L", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SPARKLING-WATER-IRON-BR", "name": "Sparkling Water Iron Brew", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SIP-SAP-ORANGE", "name": "Sip Sap Orange", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "BEV-SIP-SAP-GUAVA", "name": "Sip Sap Guava", "category": "Beverages", "unit": Unit.BOTTLE},
    {"sku": "CM-SANDWICH", "name": "Sandwich", "category": "Cooked Meat", "unit": Unit.EACH},
    {"sku": "CM-RUSSIAN", "name": "Russian", "category": "Cooked Meat", "unit": Unit.EACH},
    {"sku": "CM-POLONY", "name": "Polony", "category": "Cooked Meat", "unit": Unit.EACH},
    {"sku": "CM-INQINA-LEGUSHA", "name": "Inqina Legusha", "category": "Cooked Meat", "unit": Unit.EACH},
    {"sku": "CM-INTLOKO-YEGUSHA", "name": "Intloko Yegusha", "category": "Cooked Meat", "unit": Unit.EACH},
    {"sku": "BAK-STEAM-BREAD", "name": "Steam Bread", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "CM-COOKED-WINGS", "name": "Cooked Wings", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-COOKED-KOTA-LEGS", "name": "Cooked Kota Legs", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-COOKED-ISIFUBA", "name": "Cooked Isifuba", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-COOKED-GIZZARDS", "name": "Cooked Gizzards", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-GRILLED-PORK", "name": "Grilled Pork", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-COOKED-BEEF-STEW", "name": "Cooked Beef Stew", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-PORK-TROTTERS", "name": "Pork Trotters", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "CM-FRIED-CHIPS", "name": "Fried Chips", "category": "Cooked Meat", "unit": Unit.KG},
    {"sku": "FM-SPARE-RIBS", "name": "Spare Ribs", "category": "Fresh Meat", "unit": Unit.KG},
    {"sku": "BAK-BROWN-BREAD-LOAF", "name": "Brown Bread Loaf", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "BAK-WHITE-BREAD-LOAF", "name": "White Bread Loaf", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "BAK-HALF-BROWN-BREAD", "name": "Half Brown Bread", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "BAK-HALF-WHITE-BREAD", "name": "Half White Bread", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "BAK-KOTA-WHITE-BREAD", "name": "Kota White Bread", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "BAK-KOTA-BROWN-BREAD", "name": "Kota Brown Bread", "category": "Bakery", "unit": Unit.LOAF},
    {"sku": "FM-PORK-CHOPS", "name": "Pork Chops", "category": "Fresh Meat", "unit": Unit.KG},
    {"sku": "FM-PORK-BELLY", "name": "Pork Belly", "category": "Fresh Meat", "unit": Unit.KG},
    {"sku": "FM-BEEF-STEW", "name": "Beef Stew", "category": "Fresh Meat", "unit": Unit.KG},
    {"sku": "FM-SAUSAGE", "name": "Sausage", "category": "Fresh Meat", "unit": Unit.KG},
    {"sku": "FM-BEEF-KIDNEY", "name": "Beef Kidney", "category": "Fresh Meat", "unit": Unit.KG},
]


def get_or_create_category(db: Session, name: str) -> tuple[Category, bool]:
    category = db.query(Category).filter(Category.name == name).first()
    if category:
        return category, False

    category = Category(name=name)
    db.add(category)
    db.flush()
    return category, True


def create_product_if_missing(
    db: Session,
    product_data: dict,
    categories_by_name: dict[str, Category],
) -> bool:
    existing_product = db.query(Product).filter(Product.sku == product_data["sku"]).first()
    if existing_product:
        return False

    product = Product(
        sku=product_data["sku"],
        name=product_data["name"],
        category_id=categories_by_name[product_data["category"]].id,
        unit_of_measure=product_data["unit"].value,
        purchase_price=0,
        selling_price=0,
        minimum_stock=0,
        current_stock=0,
        active=True,
    )
    db.add(product)
    return True


def main() -> None:
    db = SessionLocal()
    categories_created = 0
    products_created = 0
    products_skipped = 0

    try:
        categories_by_name = {}
        for category_name in CATEGORIES:
            category, created = get_or_create_category(db, category_name)
            categories_by_name[category_name] = category
            if created:
                categories_created += 1

        for product_data in PRODUCTS:
            created = create_product_if_missing(db, product_data, categories_by_name)
            if created:
                products_created += 1
            else:
                products_skipped += 1

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print(f"Categories created: {categories_created}")
    print(f"Products created: {products_created}")
    print(f"Products skipped: {products_skipped}")


if __name__ == "__main__":
    main()
