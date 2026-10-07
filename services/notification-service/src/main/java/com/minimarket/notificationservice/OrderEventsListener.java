package com.minimarket.notificationservice;

import java.nio.charset.StandardCharsets;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventsListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventsListener.class);

    @KafkaListener(topics = "order.created")
    public void onOrderCreated(OrderCreatedEvent event) {
        // Mock notification: a real implementation would send an email or push here.
        // Any exception thrown here is retried, then the record goes to order.created.DLT.
        log.info("[MOCK EMAIL] to={} : order {} confirmed, total={}", event.customerEmail(), event.orderId(),
                event.totalAmount());
    }

    /** Visibility on dead-lettered events; replace with alerting / a replay tool. */
    @KafkaListener(topics = KafkaErrorConfig.ORDER_CREATED_DLT, groupId = "notification-service-dlt",
            properties = "value.deserializer=org.apache.kafka.common.serialization.ByteArrayDeserializer")
    public void onDeadLetter(ConsumerRecord<String, byte[]> record) {
        log.error("[DLT] key={} partition={} offset={} payload={}", record.key(), record.partition(),
                record.offset(), new String(record.value(), StandardCharsets.UTF_8));
    }
}
