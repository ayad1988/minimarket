package com.minimarket.orderservice;

import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository repository;
    private final KafkaTemplate<String, Object> kafka;
    private final String topic;

    public OrderService(OrderRepository repository, KafkaTemplate<String, Object> kafka,
            @Value("${minimarket.kafka.topics.order-created}") String topic) {
        this.repository = repository;
        this.kafka = kafka;
        this.topic = topic;
    }

    // Not @Transactional on purpose: the event is sent only after save() has committed.
    // Known limitation: if Kafka is down after the commit the event is lost (an outbox would fix that).
    public Order create(OrderDtos.CreateOrderRequest request) {
        List<OrderItem> items = request.items().stream()
                .map(i -> new OrderItem(i.productId(), i.quantity(), i.unitPrice()))
                .toList();
        Order order = repository.save(new Order(request.customerEmail(), items));

        kafka.send(topic, order.getId().toString(),
                new OrderCreatedEvent(order.getId(), order.getCustomerEmail(), order.getTotalAmount(),
                        order.getCreatedAt()))
                .whenComplete((r, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish order.created for {}", order.getId(), ex);
                    } else {
                        log.info("Published order.created for {}", order.getId());
                    }
                });
        return order;
    }

    public Order get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }
}
