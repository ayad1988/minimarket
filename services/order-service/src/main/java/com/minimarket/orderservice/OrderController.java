package com.minimarket.orderservice;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    /** Guest checkout is allowed: jwt is null for anonymous callers. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDtos.OrderResponse create(@Valid @RequestBody OrderDtos.CreateOrderRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String customerId = jwt == null ? null : jwt.getSubject();
        String email = jwt == null ? null : jwt.getClaimAsString("email");
        return OrderDtos.OrderResponse.from(service.create(request, customerId, email));
    }

    /** Orders of the signed-in customer, newest first (security requires authentication). */
    @GetMapping("/mine")
    public List<OrderDtos.OrderResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return service.forCustomer(jwt.getSubject()).stream().map(OrderDtos.OrderResponse::from).toList();
    }

    @GetMapping("/{id}")
    public OrderDtos.OrderResponse get(@PathVariable UUID id) {
        return OrderDtos.OrderResponse.from(service.get(id));
    }
}
