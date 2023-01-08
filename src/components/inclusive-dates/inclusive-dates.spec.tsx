import { newSpecPage, SpecPage } from "@stencil/core/testing";
import { InclusiveDates } from "./inclusive-dates";

function getInput(page: SpecPage): HTMLInputElement {
  return page.root.querySelector<HTMLInputElement>(".wc-datepicker__input");
}
function getLabel(page: SpecPage): HTMLLabelElement {
  return page.root.querySelector<HTMLLabelElement>(".wc-datepicker__label");
}

/*function getCalendarButton(page: SpecPage): HTMLButtonElement {
  return page.root.querySelector<HTMLButtonElement>(
    '.wc-datepicker__calendar-button'
  );
}*/
/*function getModal(page: SpecPage): HTMLInclusiveDatesModalElement {
  return page.root.querySelector<HTMLInclusiveDatesModalElement>(
    "inclusive-dates-modal"
  );
}*/

describe("inclusive-dates", () => {
  it("Label and input are correctly associated", async () => {
    const page = await newSpecPage({
      components: [InclusiveDates],
      html: `<inclusive-dates pickerid="test123"></inclusive-dates>`,
      language: "en"
    });
    const input = getInput(page);
    const label = getLabel(page);
    expect(input.getAttribute("id")).not.toContain("undefined");
    expect(label.getAttribute("htmlFor")).not.toContain("undefined");

    expect(input.getAttribute("id")).toEqual(label.getAttribute("htmlFor"));
  });
});
