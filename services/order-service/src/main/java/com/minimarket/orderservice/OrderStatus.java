package com.minimarket.orderservice;

public enum OrderStatus {
    CREATED, PAID, SHIPPED, CANCELLED;

    public boolean canGoTo(OrderStatus next) {
        return switch (this) {
            case CREATED -> next == PAID || next == CANCELLED;
            case PAID -> next == SHIPPED || next == CANCELLED;
            case SHIPPED, CANCELLED -> false;
        };
    }
}
