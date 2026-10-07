package com.minimarket.orderservice;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Back-office endpoints. Access is restricted to the admin role in SecurityConfig. */
@RestController
@RequestMapping("/admin")
public class AdminOrderController {

    private static final int MAX_PAGE_SIZE = 100;

    private final AdminOrderService service;

    public AdminOrderController(AdminOrderService service) {
        this.service = service;
    }

    @GetMapping("/orders")
    public Page<OrderDtos.OrderResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return service.list(status, pageable).map(OrderDtos.OrderResponse::from);
    }

    @PatchMapping("/orders/{id}/status")
    public OrderDtos.OrderResponse changeStatus(@PathVariable UUID id,
            @Valid @RequestBody AdminDtos.StatusRequest body) {
        return OrderDtos.OrderResponse.from(service.changeStatus(id, body.status()));
    }

    @GetMapping("/stats")
    public AdminDtos.Stats stats() {
        return service.stats();
    }
}
