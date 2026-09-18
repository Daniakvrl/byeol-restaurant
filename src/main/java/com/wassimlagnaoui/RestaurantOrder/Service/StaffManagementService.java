package com.wassimlagnaoui.RestaurantOrder.Service;

import com.wassimlagnaoui.RestaurantOrder.DTO.Requests.AddStaffDTO;
import com.wassimlagnaoui.RestaurantOrder.DTO.Response.staffAddedResponse;
import com.wassimlagnaoui.RestaurantOrder.DTO.Response.StaffInfoDTO;
import com.wassimlagnaoui.RestaurantOrder.Exception.ResourceNotFoundException;
import com.wassimlagnaoui.RestaurantOrder.Repository.StaffRepository;
import com.wassimlagnaoui.RestaurantOrder.model.Staff;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffManagementService {
    //dependencies would be injected here, such as repositories or other services
    private final StaffRepository staffRepository;

    public StaffManagementService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    // methods for managing staff

    public staffAddedResponse addStaff(AddStaffDTO dto) {
        Staff staff = new Staff();
        staff.setFirstName(dto.getFirstName());
        staff.setLastName(dto.getLastName());
        staff.setEmail(dto.getEmail());
        staff.setEmployeeId(dto.getEmployeeId());
        staff.setRole(dto.getRole());
        // Save staff (ID will be auto-generated if annotated with @GeneratedValue in entity)
        Staff saved = staffRepository.save(staff);
        return new staffAddedResponse("Staff member added successfully", saved.getEmployeeId());
    }

    public List<StaffInfoDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(staff -> new StaffInfoDTO(
                        staff.getId(),
                        staff.getFirstName(),
                        staff.getLastName(),
                        staff.getEmail(),
                        staff.getEmployeeId(),
                        staff.getRole()
                ))
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff member not found with id: " + id);
        }
        staffRepository.deleteById(id);
    }
}
