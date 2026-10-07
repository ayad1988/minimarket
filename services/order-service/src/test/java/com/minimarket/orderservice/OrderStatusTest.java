package com.minimarket.orderservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class OrderStatusTest {

    @Test
    void happyPathIsCreatedPaidShipped() {
        assertThat(OrderStatus.CREATED.canGoTo(OrderStatus.PAID)).isTrue();
        assertThat(OrderStatus.PAID.canGoTo(OrderStatus.SHIPPED)).isTrue();
    }

    @Test
    void cannotSkipOrGoBackwards() {
        assertThat(OrderStatus.CREATED.canGoTo(OrderStatus.SHIPPED)).isFalse();
        assertThat(OrderStatus.PAID.canGoTo(OrderStatus.CREATED)).isFalse();
    }

    @Test
    void cancellationIsPossibleUntilShipped() {
        assertThat(OrderStatus.CREATED.canGoTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.PAID.canGoTo(OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatus.SHIPPED.canGoTo(OrderStatus.CANCELLED)).isFalse();
    }

    @Test
    void finalStatesAreTerminal() {
        for (OrderStatus next : OrderStatus.values()) {
            assertThat(OrderStatus.SHIPPED.canGoTo(next)).isFalse();
            assertThat(OrderStatus.CANCELLED.canGoTo(next)).isFalse();
        }
    }

    @Test
    void orderRejectsInvalidTransition() {
        Order order = new Order("a@b.fr", null, List.of(new OrderItem("p1", 1, BigDecimal.TEN)));
        assertThatThrownBy(() -> order.changeStatus(OrderStatus.SHIPPED))
                .isInstanceOf(InvalidStatusTransitionException.class);
        order.changeStatus(OrderStatus.PAID);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
    }
}
