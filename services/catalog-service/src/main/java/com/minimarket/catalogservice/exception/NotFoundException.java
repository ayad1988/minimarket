package com.minimarket.catalogservice.exception;

public class NotFoundException extends RuntimeException{
    public NotFoundException(String message) { super(message); }
}
