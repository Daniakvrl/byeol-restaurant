package com.wassimlagnaoui.RestaurantOrder.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {


    private Long id;


    private String name;


    private String description;


    private double price;


    private String category;


    private String imageUrl;


    private boolean available;

}