import { render, replace, remove } from '../framework/render.js';
import RoutePointView from '../view/route-point.js';
import EditingFormView from '../view/form-edit';
import { USER_ACTIONS, UPDATE_TYPES } from '../utils.js';

const TYPE = {
  DEFAULT: 'default',
  EDIT: 'edit'
};

export default class EventPresenter {
  #eventsList;
  #changeData;
  #switchType;
  #component;
  #editComponent;
  #event;
  #offers = null;
  #destinations = null;
  #type = TYPE.DEFAULT;

  constructor(pointList, changeData, switchType) {
    this.#eventsList = pointList;
    this.#changeData = changeData;
    this.#switchType = switchType;
  }

  init = (event, offers, destinations) => {
    this.#event = event;
    this.#offers = offers;
    this.#destinations = destinations;
    const previousEvent = this.#component;
    const previousEventEdit = this.#editComponent;
    this.#component = new RoutePointView(this.#event, this.#offers, this.#destinations);
    this.#component.setRollUpHandler(this.#handleEditClick);
    this.#component.setFavoriteHandler(this.#handleFavoriteClick);
    this.#editComponent = new EditingFormView(this.#event, this.#offers, this.#destinations);
    this.#editComponent.setRollDownHandler(this.#handleEventClick);
    this.#editComponent.setSaveHandler(this.#saveHandler);
    this.#editComponent.setDeleteHandler(this.#deleteHandler);

    if (!previousEvent || !previousEventEdit) {
      render(this.#component, this.#eventsList);
      return;
    }

    if (this.#type === TYPE.DEFAULT) {
      replace(this.#component, previousEvent);
    }

    if (this.#type === TYPE.EDIT) {
      replace(this.#editComponent, previousEventEdit);
      this.#type = TYPE.DEFAULT;
    }

    remove(previousEvent);
    remove(previousEventEdit);
  };

  setSaving = () => {
    if (this.#type === TYPE.EDIT) {
      this.#editComponent.updateElement({ isDisabled: true, isSaving: true, });
    }
  };

  setDeleting = () => {
    if (this.#type === TYPE.EDIT) {
      this.#editComponent.updateElement({ isDisabled: true, isDeleting: true, });
    }
  };

  setAborting = () => {
    if (this.#type === TYPE.DEFAULT) {
      this.#editComponent.shake();
      return;
    }
    const resetFormState = () => {
      this.#editComponent.updateElement({ isDisabled: false, isSaving: false, isDeleting: false });
    };
    this.#editComponent.shake(resetFormState);
  };

  destroy = () => {
    remove(this.#component);
    remove(this.#editComponent);
  };

  resetView = () => {
    if (this.#type !== TYPE.DEFAULT) {
      this.#editComponent.reset(this.#event, this.#offers, this.#destinations);
      this.#editToEvent();
    }
  };

  updateView = () => {
    if (this.#type !== TYPE.DEFAULT) {
      this.#editToEvent();
    }
  };

  #eventToEdit = () => {
    replace(this.#editComponent, this.#component);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#switchType();
    this.#type = TYPE.EDIT;
  };

  #editToEvent = () => {
    replace(this.#component, this.#editComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#type = TYPE.DEFAULT;
  };

  #escKeyDownHandler = (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      this.#editComponent.reset(this.#event, this.#offers, this.#destinations);
      this.#editToEvent();
    }
  };

  #handleFavoriteClick = () => this.#changeData(
    USER_ACTIONS.UPDATE,
    UPDATE_TYPES.MINOR,
    { ...this.#event, isFavorite: !this.#event.isFavorite }
  );

  #handleEditClick = () => this.#eventToEdit();
  #handleEventClick = () => {
    if (this.#type !== TYPE.DEFAULT) {
      this.#editComponent.reset(this.#event, this.#offers, this.#destinations);
      this.#editToEvent();
    }
  };

  #saveHandler = (update) => {
    this.#changeData(USER_ACTIONS.UPDATE, UPDATE_TYPES.MINOR, update);
  };

  #deleteHandler = (event) => {
    this.#changeData(
      USER_ACTIONS.DELETE,
      UPDATE_TYPES.MINOR,
      event,
    );
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };
}
