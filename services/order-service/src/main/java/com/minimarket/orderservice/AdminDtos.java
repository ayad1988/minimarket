package com.minimarket.orderservice;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record StatusRequest(@NotNull OrderStatus status) {
    }

    public record DailyRevenue(LocalDate day, BigDecimal revenue, long orders) {
    }

    public record TopProduct(String productId, long quantity) {
    }

    public record Stats(
            long totalOrders,
            BigDecimal revenue,
            BigDecimal averageOrderValue,
            Map<OrderStatus, Long> byStatus,
            List<DailyRevenue> last14Days,
            List<TopProduct> topProducts) {
    }
}
