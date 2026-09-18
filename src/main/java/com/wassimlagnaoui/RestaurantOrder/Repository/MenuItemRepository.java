package com.wassimlagnaoui.RestaurantOrder.Repository;


import com.wassimlagnaoui.RestaurantOrder.model.Category;
import com.wassimlagnaoui.RestaurantOrder.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface MenuItemRepository
        extends JpaRepository<MenuItem, Long> {


    List<MenuItem> findByAvailableTrue();


    List<MenuItem> findByCategory(Category category);


    List<MenuItem> findByCategory_NameIgnoreCase(String categoryName);


}