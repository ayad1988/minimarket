package com.minimarket.orderservice;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);

    List<Order> findByCreatedAtGreaterThanEqual(Instant since);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status <> com.minimarket.orderservice.OrderStatus.CANCELLED")
    BigDecimal totalRevenue();

    /** Rows of [productId, totalQuantity] for non-cancelled orders, best sellers first. */
    @Query("""
            select i.productId, sum(i.quantity) from Order o join o.items i
            where o.status <> com.minimarket.orderservice.OrderStatus.CANCELLED
            group by i.productId order by sum(i.quantity) desc
            """)
    List<Object[]> topProducts(Pageable pageable);
}
