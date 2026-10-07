package com.minimarket.notificationservice;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Mirror of the event published by order-service on order.created. */
public record OrderCreatedEvent(UUID orderId, String customerEmail, BigDecimal totalAmount, Instant createdAt) {
}
