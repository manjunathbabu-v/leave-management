package com.ikaansh.leavemanagement.repository;

import com.ikaansh.leavemanagement.entity.LeaveRequest;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findAll(Pageable pageable);
    List<LeaveRequest> findByEmployeeUsernameOrderByIdDesc(String username);	
}
