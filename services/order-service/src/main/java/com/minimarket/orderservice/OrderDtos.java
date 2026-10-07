package com.minimarket.orderservice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class OrderDtos {

    private OrderDtos() {
    }

    public record CreateOrderItem(
            @NotBlank String productId,
            @Min(1) int quantity,
            @NotNull @DecimalMin("0.0") BigDecimal unitPrice) {
    }

    public record CreateOrderRequest(
            @NotBlank @Email String customerEmail,
            @NotEmpty @Valid List<CreateOrderItem> items) {
    }

    public record OrderResponse(
            UUID id,
            String customerEmail,
            OrderStatus status,
            BigDecimal totalAmount,
            Instant createdAt,
            List<CreateOrderItem> items) {

        static OrderResponse from(Order o) {
            return new OrderResponse(o.getId(), o.getCustomerEmail(), o.getStatus(), o.getTotalAmount(),
                    o.getCreatedAt(),
                    o.getItems().stream()
                            .map(i -> new CreateOrderItem(i.getProductId(), i.getQuantity(), i.getUnitPrice()))
                            .toList());
        }
    }
}
