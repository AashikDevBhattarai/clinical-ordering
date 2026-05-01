package com.example.clinicalordering.service;

import com.example.clinicalordering.domain.StudyOrder;
import com.example.clinicalordering.dto.OrderRequest;
import com.example.clinicalordering.dto.OrderResponse;
import com.example.clinicalordering.factory.StudyOrderFactory;
import com.example.clinicalordering.mapper.OrderMapper;
import com.example.clinicalordering.repository.StudyOrderRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

    private final StudyOrderRepository studyOrderRepository;
    private final ClinicalLookupService clinicalLookupService;
    private final StudyOrderFactory studyOrderFactory;
    private final OrderMapper orderMapper;

    public OrderService(
            StudyOrderRepository studyOrderRepository,
            ClinicalLookupService clinicalLookupService,
            StudyOrderFactory studyOrderFactory,
            OrderMapper orderMapper
    ) {
        this.studyOrderRepository = studyOrderRepository;
        this.clinicalLookupService = clinicalLookupService;
        this.studyOrderFactory = studyOrderFactory;
        this.orderMapper = orderMapper;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findOrders(Long patientId) {
        List<StudyOrder> orders = patientId == null
                ? studyOrderRepository.findAllByOrderByCreatedAtDesc()
                : studyOrderRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        return orders.stream().map(orderMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        return orderMapper.toResponse(clinicalLookupService.getOrder(id));
    }

    public OrderResponse createOrder(OrderRequest request) {
        StudyOrder order = studyOrderFactory.create(request, clinicalLookupService.getPatient(request.patientId()));
        return orderMapper.toResponse(studyOrderRepository.save(order));
    }
}
