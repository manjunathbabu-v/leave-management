package com.ikaansh.leavemanagement.service;

import com.ikaansh.leavemanagement.entity.*;
import com.ikaansh.leavemanagement.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository, UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
    }

    public LeaveRequest createLeaveRequest(LeaveRequest request, String username) {
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        request.setEmployee(employee);
        request.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(request);
    }

    public Page<LeaveRequest> getAllLeaveRequests(Pageable pageable) {
        return leaveRequestRepository.findAll(pageable);
    }

    public LeaveRequest updateStatus(Long id, LeaveStatus status) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(status);
        return leaveRequestRepository.save(leave);
    }
    public java.util.List<LeaveRequest> getMyLeaves(String username) {
        return leaveRequestRepository.findByEmployeeUsernameOrderByIdDesc(username);
    }
}