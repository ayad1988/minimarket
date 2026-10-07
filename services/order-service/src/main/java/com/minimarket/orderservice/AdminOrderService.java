package com.minimarket.orderservice;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderService {

    private static final ZoneId SHOP_ZONE = ZoneId.of("Europe/Paris");
    private static final int CHART_DAYS = 14;

    private final OrderRepository repository;

    public AdminOrderService(OrderRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<Order> list(OrderStatus status, Pageable pageable) {
        return status == null ? repository.findAll(pageable) : repository.findByStatus(status, pageable);
    }

    @Transactional
    public Order changeStatus(UUID id, OrderStatus next) {
        Order order = repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        order.changeStatus(next);
        return order;
    }

    @Transactional(readOnly = true)
    public AdminDtos.Stats stats() {
        long total = repository.count();
        BigDecimal revenue = repository.totalRevenue();
        long paying = total - repository.countByStatus(OrderStatus.CANCELLED);
        BigDecimal average = paying == 0 ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(paying), 2, RoundingMode.HALF_UP);

        Map<OrderStatus, Long> byStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.put(s, repository.countByStatus(s));
        }

        LocalDate first = LocalDate.now(SHOP_ZONE).minusDays(CHART_DAYS - 1L);
        Instant since = first.atStartOfDay(SHOP_ZONE).toInstant();

        Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();
        Map<LocalDate, Long> ordersByDay = new HashMap<>();
        for (Order o : repository.findByCreatedAtGreaterThanEqual(since)) {
            if (o.getStatus() == OrderStatus.CANCELLED) {
                continue;
            }
            LocalDate day = o.getCreatedAt().atZone(SHOP_ZONE).toLocalDate();
            revenueByDay.merge(day, o.getTotalAmount(), BigDecimal::add);
            ordersByDay.merge(day, 1L, Long::sum);
        }
        List<AdminDtos.DailyRevenue> days = new ArrayList<>();
        for (int i = 0; i < CHART_DAYS; i++) {
            LocalDate d = first.plusDays(i);
            days.add(new AdminDtos.DailyRevenue(d, revenueByDay.getOrDefault(d, BigDecimal.ZERO),
                    ordersByDay.getOrDefault(d, 0L)));
        }

        List<AdminDtos.TopProduct> top = repository.topProducts(PageRequest.of(0, 5)).stream()
                .map(r -> new AdminDtos.TopProduct((String) r[0], ((Number) r[1]).longValue()))
                .toList();

        return new AdminDtos.Stats(total, revenue, average, byStatus, days, top);
    }
}
