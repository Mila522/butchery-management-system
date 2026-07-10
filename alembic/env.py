from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.core.database import Base

# Import every model so SQLAlchemy knows about them
from app.models.business_day import BusinessDay
from app.models.category import Category
from app.models.daily_analytics import DailyAnalytics
from app.models.daily_stock import DailyStock
from app.models.damage import Damage
from app.models.delivery import Delivery
from app.models.delivery_item import DeliveryItem
from app.models.inventory_adjustment import InventoryAdjustment
from app.models.product import Product
from app.models.product_daily_status import ProductDailyStatus
from app.models.user import User

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()
