"""Add users fields for name role and regional

Revision ID: 4cf1df3a7976
Revises: 2cd087d523ca
Create Date: 2024-12-06 12:12:38.599429

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4cf1df3a7976"
down_revision: Union[str, None] = "2cd087d523ca"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем enum типы
    op.execute(
        "CREATE TYPE userroles AS ENUM ('REGIONAL_ADMIN', 'CENTRAL_ADMIN', 'USER', 'ADMIN')"
    )
    op.execute(
        """
        CREATE TYPE regions AS ENUM (
            'ADYGEA', 'ALTAI_REPUBLIC', 'BASHKORTOSTAN', 'BURYATIA', 'DAGESTAN',
            'DONECK', 'INGUSHETIA', 'KABARDINO_BALKARIA', 'KALMYKIA',
            'KARACHAY_CHERKESSIA', 'KARELIA', 'KOMI', 'CRIMEA', 'MARI_EL',
            'MORDOVIA', 'SAKHA_YAKUTIA', 'NORTH_OSSETIA_ALANIA', 'TATARSTAN',
            'TUVA', 'UDMURTIA', 'KHAKASSIA', 'CHECHNYA', 'CHUVASHIA', 'LUGANSK',
            'ALTAY_TERRITORY', 'ZABAIKALSKY_TERRITORY', 'KAMCHATKA_TERRITORY',
            'KRASNODAR_TERRITORY', 'KRASNOYARSK_TERRITORY', 'PERM_TERRITORY',
            'PRIMORSKY_TERRITORY', 'STAVROPOL_TERRITORY', 'KHABAROVSK_TERRITORY',
            'AMUR_REGION', 'ARKHANGELSK_REGION', 'ASTRAKHAN_REGION', 'BELGOROD_REGION',
            'BRYANSK_REGION', 'VLADIMIR_REGION', 'VOLGOGRAD_REGION', 'VOLOGDA_REGION',
            'VORONEZH_REGION', 'IVANOVO_REGION', 'IRKUTSK_REGION', 'KALININGRAD_REGION',
            'KALUGA_REGION', 'KEMEROVO_REGION', 'KIROV_REGION', 'KOSTROMA_REGION',
            'KURGAN_REGION', 'KURSK_REGION', 'LENINGRAD_REGION', 'LIPETSK_REGION',
            'MAGADAN_REGION', 'MOSCOW_REGION', 'MURMANSK_REGION', 'NIZHNY_NOVGOROD_REGION',
            'NOVGOROD_REGION', 'NOVOSIBIRSK_REGION', 'OMSK_REGION', 'ORENBURG_REGION',
            'ORYOL_REGION', 'PENZA_REGION', 'PSKOV_REGION', 'ROSTOV_REGION',
            'RYAZAN_REGION', 'SAMARA_REGION', 'SARATOV_REGION', 'SAKHALIN_REGION',
            'SVERDLOVSK_REGION', 'SMOLENSK_REGION', 'TAMBOV_REGION', 'TVER_REGION',
            'TOMSK_REGION', 'TULA_REGION', 'TYUMEN_REGION', 'ULYANOVSK_REGION',
            'CHELYABINSK_REGION', 'YAROSLAVL_REGION', 'ZAPOROZHIE', 'HERSONSK',
            'MOSCOW', 'SAINT_PETERSBURG', 'SEVASTOPOL', 'JEWISH_AUTONOMOUS_REGION',
            'NENETS_AUTONOMOUS_OKRUG', 'KHANTY_MANSI_AUTONOMOUS_OKRUG',
            'CHUKOTKA_AUTONOMOUS_OKRUG', 'YAMAL_NENETS_AUTONOMOUS_OKRUG'
        )
        """
    )

    # Добавляем колонки
    op.add_column("users", sa.Column("name", sa.String(), nullable=True))
    
    # Добавляем role как nullable
    op.add_column(
        "users",
        sa.Column("role", sa.Enum(name="userroles", create_type=False), nullable=True),
    )
    
    # Устанавливаем значение по умолчанию для существующих записей
    op.execute("UPDATE users SET role = 'USER' WHERE role IS NULL")
    
    # Делаем колонку NOT NULL
    op.alter_column("users", "role", nullable=False)
    
    # Добавляем regional
    op.add_column(
        "users",
        sa.Column("region", sa.Enum(name="regions", create_type=False), nullable=True),
    )


def downgrade() -> None:
    # Удаляем колонки
    op.drop_column("users", "region")
    op.drop_column("users", "role")
    op.drop_column("users", "name")
    
    # Удаляем enum типы
    op.execute("DROP TYPE regions")
    op.execute("DROP TYPE userroles")
