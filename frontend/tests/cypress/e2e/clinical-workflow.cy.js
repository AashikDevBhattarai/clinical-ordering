describe("Clinical ordering workflow", () => {
  it("creates a patient, places an order, then finalizes, amends, and cancels a report", () => {
    const patients = [];
    const orders = [];
    const reports = {};
    let reportSequence = 1;
    let orderSequence = 1;
    let patientSequence = 1;

    cy.intercept("GET", "http://localhost:8080/api/patients*", (request) => {
      request.reply(patients);
    }).as("getPatients");

    cy.intercept("POST", "http://localhost:8080/api/patients", (request) => {
      const patient = {
        id: patientSequence++,
        ...request.body,
      };
      patients.push(patient);
      request.reply(201, patient);
    }).as("createPatient");

    cy.intercept("GET", "http://localhost:8080/api/orders*", (request) => {
      const patientId = Number(request.query.patientId);
      request.reply(orders.filter((order) => order.patientId === patientId));
    }).as("getOrders");

    cy.intercept("POST", "http://localhost:8080/api/orders", (request) => {
      const reportId = reportSequence++;
      const order = {
        id: orderSequence++,
        ...request.body,
        patientDisplayName: "Hopper, Grace (MRN-9001)",
        status: "ORDERED",
        reportId,
        reportStatus: "DRAFT",
      };
      orders.push(order);
      reports[reportId] = {
        id: reportId,
        orderId: order.id,
        patientId: order.patientId,
        patientDisplayName: "Hopper, Grace (MRN-9001)",
        status: "DRAFT",
        orderStatus: "ORDERED",
        findings: "",
        amendmentReason: null,
        cancelReason: null,
        finalizedAt: null,
        amendedAt: null,
        canceledAt: null,
      };
      request.reply(201, order);
    }).as("createOrder");

    cy.intercept("GET", "http://localhost:8080/api/reports/*", (request) => {
      const reportId = Number(request.url.split("/").pop());
      request.reply(reports[reportId]);
    }).as("getReport");

    cy.intercept("PUT", "http://localhost:8080/api/reports/*/draft", (request) => {
      const reportId = Number(request.url.split("/").at(-2));
      reports[reportId] = {
        ...reports[reportId],
        findings: request.body.findings,
      };
      request.reply(reports[reportId]);
    }).as("saveDraft");

    cy.intercept("POST", "http://localhost:8080/api/reports/*/finalize", (request) => {
      const reportId = Number(request.url.split("/").at(-2));
      reports[reportId] = {
        ...reports[reportId],
        findings: request.body.findings,
        status: "FINALIZED",
        orderStatus: "FINALIZED",
        finalizedAt: "2026-04-28T10:00:00Z",
      };
      const order = orders.find((item) => item.reportId === reportId);
      order.status = "FINALIZED";
      order.reportStatus = "FINALIZED";
      request.reply(reports[reportId]);
    }).as("finalizeReport");

    cy.intercept("POST", "http://localhost:8080/api/reports/*/amend", (request) => {
      const reportId = Number(request.url.split("/").at(-2));
      reports[reportId] = {
        ...reports[reportId],
        findings: request.body.findings,
        amendmentReason: request.body.amendmentReason,
        status: "AMENDED",
        orderStatus: "AMENDED",
        amendedAt: "2026-04-28T10:05:00Z",
      };
      const order = orders.find((item) => item.reportId === reportId);
      order.status = "AMENDED";
      order.reportStatus = "AMENDED";
      request.reply(reports[reportId]);
    }).as("amendReport");

    cy.intercept("POST", "http://localhost:8080/api/reports/*/cancel", (request) => {
      const reportId = Number(request.url.split("/").at(-2));
      reports[reportId] = {
        ...reports[reportId],
        cancelReason: request.body.cancelReason,
        status: "CANCELED",
        orderStatus: "CANCELED",
        canceledAt: "2026-04-28T10:10:00Z",
      };
      const order = orders.find((item) => item.reportId === reportId);
      order.status = "CANCELED";
      order.reportStatus = "CANCELED";
      request.reply(reports[reportId]);
    }).as("cancelReport");

    cy.visit("/");
    cy.wait("@getPatients");

    cy.get("[data-testid='patient-first-name-input']").type("Grace");
    cy.get("[data-testid='patient-last-name-input']").type("Hopper");
    cy.get("[data-testid='patient-mrn-input']").type("MRN-9001");
    cy.get("[data-testid='save-patient-button']").click();

    cy.wait("@createPatient");
    cy.contains("Patient Hopper, Grace created.").should("be.visible");

    cy.get("[data-testid='ordered-by-input']").type("Dr. Bailey");
    cy.get("[data-testid='order-reason-input']").type("Evaluate dyspnea and murmur");
    cy.get("[data-testid='place-order-button']").click();

    cy.wait("@createOrder");
    cy.contains("draft report created").should("be.visible");

    cy.get("[data-testid='report-findings-input']")
      .clear()
      .type("Normal left ventricular size and preserved systolic function.");
    cy.get("[data-testid='finalize-report-button']").click();
    cy.wait("@finalizeReport");
    cy.contains("Report finalized.").should("be.visible");

    cy.get("[data-testid='report-action-note-input']").type(
      "Added missing ventricular wall detail",
    );
    cy.get("[data-testid='amend-report-button']").click();
    cy.wait("@amendReport");
    cy.contains("Report amended.").should("be.visible");

    cy.get("[data-testid='report-action-note-input']")
      .clear()
      .type("Duplicate study entered in error");
    cy.get("[data-testid='cancel-report-button']").click();
    cy.wait("@cancelReport");
    cy.contains("Report canceled.").should("be.visible");
    cy.contains("CANCELED").should("exist");
  });
});

