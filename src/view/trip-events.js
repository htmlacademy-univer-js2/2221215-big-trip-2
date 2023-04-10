import { createElement } from '../render.js';

const createTripEventsTemplate = () => (
  `<ul class="trip-events__list">
  </ul>`
);

export default class TripEventsView {
  constructor() {
    this.element = null;
  }

  get template() {
    return createTripEventsTemplate();
  }

  getElement() {
    this.element = this.element || createElement(this.getTemplate());
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}