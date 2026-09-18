package com.wassimlagnaoui.RestaurantOrder.Service;

import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemRequest;
import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemResponse;
import com.wassimlagnaoui.RestaurantOrder.Exception.MenuItemIdNotFoundException;
import com.wassimlagnaoui.RestaurantOrder.Exception.MenuItemNotAvailableException;
import com.wassimlagnaoui.RestaurantOrder.Repository.CategoryRepository;
import com.wassimlagnaoui.RestaurantOrder.Repository.MenuItemRepository;
import com.wassimlagnaoui.RestaurantOrder.model.Category;
import com.wassimlagnaoui.RestaurantOrder.model.MenuItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuItemServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private MenuItemService menuItemService;

    private MenuItem testMenuItem;
    private MenuItemRequest menuItemRequest;
    private Category mainCourseCategory;
    private Category appetizerCategory;

    @BeforeEach
    void setUp() {
        mainCourseCategory = new Category();
        mainCourseCategory.setId(1L);
        mainCourseCategory.setName("Main Course");

        appetizerCategory = new Category();
        appetizerCategory.setId(2L);
        appetizerCategory.setName("Appetizer");

        testMenuItem = new MenuItem();
        testMenuItem.setId(1L);
        testMenuItem.setName("Cheeseburger");
        testMenuItem.setDescription("Delicious cheeseburger with fries");
        testMenuItem.setPrice(12.99);
        testMenuItem.setCategory(mainCourseCategory);
        testMenuItem.setAvailable(true);
        testMenuItem.setImageUrl("burger.jpg");

        menuItemRequest = new MenuItemRequest();
        menuItemRequest.setName("Pizza Margherita");
        menuItemRequest.setDescription("Classic pizza with tomato and mozzarella");
        menuItemRequest.setPrice(14.99);
        menuItemRequest.setCategory("Main Course");
        menuItemRequest.setImageUrl("pizza.jpg");
        menuItemRequest.setAvailable(true);
    }

    @Test
    void findById_ShouldReturnMenuItemResponse_WhenMenuItemExists() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));

        MenuItemResponse response = menuItemService.findById(1L);

        assertNotNull(response);
        assertEquals(testMenuItem.getId(), response.getId());
        assertEquals(testMenuItem.getName(), response.getName());
        assertEquals(testMenuItem.getPrice(), response.getPrice());
        assertEquals(testMenuItem.getCategory().getName(), response.getCategory());
        assertEquals(testMenuItem.isAvailable(), response.isAvailable());

        verify(menuItemRepository).findById(1L);
    }

    @Test
    void findById_ShouldThrowException_WhenMenuItemNotFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(MenuItemIdNotFoundException.class, () -> menuItemService.findById(1L));

        verify(menuItemRepository).findById(1L);
    }

    @Test
    void findAll_ShouldReturnListOfMenuItems() {
        MenuItem secondMenuItem = new MenuItem();
        secondMenuItem.setId(2L);
        secondMenuItem.setName("Caesar Salad");
        secondMenuItem.setPrice(8.99);
        secondMenuItem.setCategory(appetizerCategory);
        secondMenuItem.setAvailable(true);

        List<MenuItem> menuItems = Arrays.asList(testMenuItem, secondMenuItem);
        when(menuItemRepository.findAll()).thenReturn(menuItems);

        List<MenuItemResponse> responses = menuItemService.findAll();

        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("Cheeseburger", responses.get(0).getName());
        assertEquals("Caesar Salad", responses.get(1).getName());

        verify(menuItemRepository).findAll();
    }

    @Test
    void findAll_ShouldReturnEmptyList_WhenNoMenuItems() {
        when(menuItemRepository.findAll()).thenReturn(Arrays.asList());

        List<MenuItemResponse> responses = menuItemService.findAll();

        assertNotNull(responses);
        assertTrue(responses.isEmpty());

        verify(menuItemRepository).findAll();
    }

    @Test
    void createMenuItem_ShouldReturnMenuItemResponse_WhenValidRequest() {
        MenuItem savedMenuItem = new MenuItem();
        savedMenuItem.setId(2L);
        savedMenuItem.setName(menuItemRequest.getName());
        savedMenuItem.setDescription(menuItemRequest.getDescription());
        savedMenuItem.setPrice(menuItemRequest.getPrice());
        savedMenuItem.setCategory(mainCourseCategory);
        savedMenuItem.setImageUrl(menuItemRequest.getImageUrl());
        savedMenuItem.setAvailable(true);

        when(categoryRepository.findByName("Main Course")).thenReturn(Optional.of(mainCourseCategory));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(savedMenuItem);

        MenuItemResponse response = menuItemService.createMenuItem(menuItemRequest);

        assertNotNull(response);
        assertEquals(savedMenuItem.getName(), response.getName());
        assertEquals(savedMenuItem.getPrice(), response.getPrice());
        assertEquals("Main Course", response.getCategory());
        assertTrue(response.isAvailable());

        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void updateAvailability_ShouldToggleToFalse_WhenCurrentlyTrue() {
        testMenuItem.setAvailable(true);
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemResponse response = menuItemService.updateAvailability(1L);

        assertNotNull(response);
        assertFalse(testMenuItem.isAvailable());

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository).save(testMenuItem);
    }

    @Test
    void updateAvailability_ShouldToggleToTrue_WhenCurrentlyFalse() {
        testMenuItem.setAvailable(false);
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemResponse response = menuItemService.updateAvailability(1L);

        assertNotNull(response);
        assertTrue(testMenuItem.isAvailable());

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository).save(testMenuItem);
    }

    @Test
    void updateAvailability_ShouldThrowException_WhenMenuItemNotFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(MenuItemNotAvailableException.class, () -> menuItemService.updateAvailability(1L));

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository, never()).save(any());
    }

    @Test
    void getAvailableMenuItems_ShouldReturnOnlyAvailableItems() {
        MenuItem unavailableItem = new MenuItem();
        unavailableItem.setId(2L);
        unavailableItem.setName("Unavailable Item");
        unavailableItem.setAvailable(false);

        List<MenuItem> allItems = Arrays.asList(testMenuItem, unavailableItem);
        when(menuItemRepository.findAll()).thenReturn(allItems);

        List<MenuItemResponse> responses = menuItemService.getAvailableMenuItems();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Cheeseburger", responses.get(0).getName());
        assertTrue(responses.get(0).isAvailable());

        verify(menuItemRepository).findAll();
    }

    @Test
    void getAvailableMenuItems_ShouldReturnEmptyList_WhenNoAvailableItems() {
        testMenuItem.setAvailable(false);
        when(menuItemRepository.findAll()).thenReturn(Arrays.asList(testMenuItem));

        List<MenuItemResponse> responses = menuItemService.getAvailableMenuItems();

        assertNotNull(responses);
        assertTrue(responses.isEmpty());

        verify(menuItemRepository).findAll();
    }

    @Test
    void getMenuItemsByCategory_ShouldReturnItemsInCategory() {
        List<MenuItem> mainCourseItems = Arrays.asList(testMenuItem);
        when(categoryRepository.findByName("Main Course")).thenReturn(Optional.of(mainCourseCategory));
        when(menuItemRepository.findByCategory(mainCourseCategory)).thenReturn(mainCourseItems);

        List<MenuItemResponse> responses = menuItemService.getMenuItemsByCategory("Main Course");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Cheeseburger", responses.get(0).getName());
        assertEquals("Main Course", responses.get(0).getCategory());

        verify(menuItemRepository).findByCategory(mainCourseCategory);
    }

    @Test
    void updateCategory_ShouldUpdateCategory_WhenMenuItemExists() {
        String newCategoryName = "Appetizer";
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(categoryRepository.findByName(newCategoryName)).thenReturn(Optional.of(appetizerCategory));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemResponse response = menuItemService.updateCategory(1L, newCategoryName);

        assertNotNull(response);
        assertEquals(newCategoryName, testMenuItem.getCategory().getName());

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository).save(testMenuItem);
    }

    @Test
    void updateCategory_ShouldThrowException_WhenMenuItemNotFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(MenuItemIdNotFoundException.class, () ->
            menuItemService.updateCategory(1L, "New Category"));

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository, never()).save(any());
    }

    @Test
    void updatePrice_ShouldUpdatePrice_WhenMenuItemExists() {
        double newPrice = 15.99;
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemResponse response = menuItemService.updatePrice(1L, newPrice);

        assertNotNull(response);
        assertEquals(newPrice, testMenuItem.getPrice());

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository).save(testMenuItem);
    }

    @Test
    void updatePrice_ShouldThrowException_WhenMenuItemNotFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(MenuItemIdNotFoundException.class, () ->
            menuItemService.updatePrice(1L, 15.99));

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository, never()).save(any());
    }

    @Test
    void updateName_ShouldUpdateName_WhenMenuItemExists() {
        String newName = "Deluxe Cheeseburger";
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemResponse response = menuItemService.updateName(1L, newName);

        assertNotNull(response);
        assertEquals(newName, testMenuItem.getName());

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository).save(testMenuItem);
    }

    @Test
    void updateName_ShouldThrowException_WhenMenuItemNotFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(MenuItemIdNotFoundException.class, () ->
            menuItemService.updateName(1L, "New Name"));

        verify(menuItemRepository).findById(1L);
        verify(menuItemRepository, never()).save(any());
    }
}