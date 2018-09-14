import { Reducer } from "redux";
import {
    CREATE_ALL_ENTITIES, CREATE_ALL_ENTITIES_SUCCEEDED, DELETE_ALL_ENTITIES, DELETE_ALL_ENTITIES_SUCCEEDED,
    DELETE_ENTITY, DELETE_ENTITY_SUCCEEDED,
    FETCH_ENTITIES, FETCH_ENTITIES_SUCCEEDED,
    POST_ENTITY, POST_ENTITY_SUCCEEDED, PUT_ENTITY, PUT_ENTITY_SUCCEEDED
} from "./entity-actions";

export interface Entity {
    id?: string,
    name: string,
    identification: string,
    countryCode: string,
    soc_sec?: string,
}

export interface EntityState {
    readonly allEntities: Entity[]
    readonly isFetching: boolean
}

const initialState: EntityState = {
    allEntities: [],
    isFetching: false
};


const entityReducer: Reducer<EntityState> = (state = initialState, action) => {
    if (action.type === FETCH_ENTITIES) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === FETCH_ENTITIES_SUCCEEDED) {
        return {...state, ...{ allEntities: action.entities, isFetching: false } };
    }

    if (action.type === POST_ENTITY) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === POST_ENTITY_SUCCEEDED) {
        return { ...state, allEntities: [...state.allEntities, action.entity], isFetching: false };
    }

    if (action.type === DELETE_ENTITY) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_ENTITY_SUCCEEDED) {
        const allEntities = state.allEntities.filter((entity) => entity.id !== action.entityId);
        return { ...state, allEntities: [...allEntities], isFetching: false };
    }

    if (action.type === PUT_ENTITY) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === PUT_ENTITY_SUCCEEDED) {
        const entityIndex = state.allEntities.findIndex((entity) => entity.id === action.entity.id);
        const entity = { ...state.allEntities[entityIndex], ...action.entity };
        const entities = [ ...state.allEntities];
        entities[entityIndex] = entity;
        return { ...state, allEntities: entities, isFetching: false };
    }

    if (action.type === CREATE_ALL_ENTITIES) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === CREATE_ALL_ENTITIES_SUCCEEDED) {
        const entities = action.entities.map((entity) => entity.data);
        return { ...state, allEntities: [ ...state.allEntities, ...entities], isFetching: false };
    }

    if (action.type === DELETE_ALL_ENTITIES) {
        return { ...state, ...{ isFetching: true } };
    }

    if (action.type === DELETE_ALL_ENTITIES_SUCCEEDED) {
        while (action.entities.length > 0) {
            action.entities.pop();
        }
        return { ...state, ...{ allEntities: action.entities }, isFetching: false };
    }

    return state;
};

export default entityReducer;