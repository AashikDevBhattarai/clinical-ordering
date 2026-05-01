import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the provided value in a readable format", () => {
    render(<StatusBadge value="FINALIZED" />);

    expect(screen.getByText("FINALIZED")).toBeInTheDocument();
  });

  it("returns nothing when no value is provided", () => {
    const { container } = render(<StatusBadge value={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});

