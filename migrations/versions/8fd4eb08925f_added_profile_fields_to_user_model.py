"""Added profile fields to User model

Revision ID: 8fd4eb08925f
Revises: e68615b02539
Create Date: 2023-12-13 15:03:36.744405

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8fd4eb08925f'
down_revision = 'e68615b02539'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('title', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('affiliation', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('specialization', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('education', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('paper', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('article', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('presentation', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('project', sa.String(length=100), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('project')
        batch_op.drop_column('presentation')
        batch_op.drop_column('article')
        batch_op.drop_column('paper')
        batch_op.drop_column('education')
        batch_op.drop_column('specialization')
        batch_op.drop_column('affiliation')
        batch_op.drop_column('title')
        batch_op.drop_column('name')

    # ### end Alembic commands ###
