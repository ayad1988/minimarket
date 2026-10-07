package com.minimarket.notificationservice;

import java.util.LinkedHashMap;
import java.util.Map;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.FixedBackOff;

/**
 * Failed records are retried 3 times (1s apart), then published to "<topic>.DLT" instead of being dropped.
 * This covers both listener failures and undeserializable (poison pill) messages.
 */
@Configuration
public class KafkaErrorConfig {

    public static final String ORDER_CREATED_DLT = "order.created.DLT";

    @Bean
    NewTopic orderCreatedDlt() {
        return TopicBuilder.name(ORDER_CREATED_DLT).partitions(1).replicas(1).build();
    }

    /** Re-publishes records whose value could not be deserialized (raw bytes). */
    @Bean
    KafkaTemplate<String, byte[]> bytesDltTemplate(KafkaProperties props) {
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(
                props.buildProducerProperties(null), new StringSerializer(), new ByteArraySerializer()));
    }

    /** Re-publishes records that deserialized fine but failed in the listener. */
    @Bean
    KafkaTemplate<String, Object> jsonDltTemplate(KafkaProperties props) {
        JsonSerializer<Object> json = new JsonSerializer<>();
        json.setAddTypeInfo(false);
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(
                props.buildProducerProperties(null), new StringSerializer(), json));
    }

    @Bean
    CommonErrorHandler kafkaErrorHandler(KafkaTemplate<String, byte[]> bytesDltTemplate,
            KafkaTemplate<String, Object> jsonDltTemplate) {
        Map<Class<?>, KafkaOperations<?, ?>> templates = new LinkedHashMap<>();
        templates.put(byte[].class, bytesDltTemplate);
        templates.put(Object.class, jsonDltTemplate);
        return new DefaultErrorHandler(new DeadLetterPublishingRecoverer(templates,
                (record, ex) -> new TopicPartition(ORDER_CREATED_DLT, -1)), new FixedBackOff(1000L, 3L));
    }
}
