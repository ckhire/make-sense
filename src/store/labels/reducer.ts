import {LabelsActionTypes, LabelsState, ImageData} from './types';
import {Action} from '../Actions';
import { ImageRepository, LableRepository } from '../../logic/imageRepository/ImageRepository';


const initialState: LabelsState = {
    activeImageIndex: null,
    activeLabelNameId: null,
    activeLabelType: null,
    activeLabelId: null,
    highlightedLabelId: null,
    imagesData: [],
    firstLabelCreatedFlag: false,
    labels: []
};

export function labelsReducer(
    state = initialState,
    action: LabelsActionTypes
): LabelsState {
    switch (action.type) {
        case Action.UPDATE_ACTIVE_IMAGE_INDEX: {
            return {
                ...state,
                activeImageIndex: action.payload.activeImageIndex
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_NAME_ID: {
            return {
                ...state,
                activeLabelNameId: action.payload.activeLabelNameId
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_ID: {
            return {
                ...state,
                activeLabelId: action.payload.activeLabelId
            }
        }
        case Action.UPDATE_HIGHLIGHTED_LABEL_ID: {
            return {
                ...state,
                highlightedLabelId: action.payload.highlightedLabelId
            }
        }
        case Action.UPDATE_ACTIVE_LABEL_TYPE: {
            return {
                ...state,
                activeLabelType: action.payload.activeLabelType
            }
        }
        case Action.UPDATE_IMAGE_DATA_BY_ID: {
            return {
                ...state,
                imagesData: state.imagesData.map((imageData: ImageData) =>
                    //imageData.id === action.payload.id ? action.payload.newImageData : imageData
                    {
                        if(imageData.id == action.payload.id) {
                            // fetch the newImage Data by id then update particular value and put that in the db
                            console.log("~~!!! does table Has Data:: ", ImageRepository.isTableHasData());
                          ImageRepository.isTableHasData() && ImageRepository.updateNewImageDataById(action.payload.newImageData);
                        return action.payload.newImageData;
                    } else {
                        return imageData;
                    }
                    })
            }
        }
        case Action.ADD_IMAGES_DATA: {
            return {
                ...state,
                imagesData: state.imagesData.concat(action.payload.imageData)
            }
        }
        case Action.UPDATE_IMAGES_DATA: {
            return {
                ...state,
                imagesData: action.payload.imageData

            }
        }
        case Action.UPDATE_LABEL_NAMES: {
            LableRepository.storeLableNames(action.payload.labels);
            return {
                ...state,
                labels: action.payload.labels
                
            }
        }
        case Action.UPDATE_FIRST_LABEL_CREATED_FLAG: {
            return {
                ...state,
                firstLabelCreatedFlag: action.payload.firstLabelCreatedFlag
            }
        }
        default:
            return state;
    }
}
