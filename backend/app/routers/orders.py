from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.connection import get_db
from app.models.models import Order, OrderItem, Product, Customer
from app.schemas.schemas import OrderCreate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found"
        )

    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must have at least one item"
        )

    # Validate all products and check inventory
    order_items_data = []
    total_amount = 0.0

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. "
                       f"Available: {product.quantity}, Requested: {item.quantity}"
            )
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })
        total_amount += product.price * item.quantity

    # Create order
    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing

    # Create order items and reduce stock
    for item_data in order_items_data:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)

    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == db_order.id).first()


@router.get("/", response_model=List[OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity
    db.delete(order)
    db.commit()
