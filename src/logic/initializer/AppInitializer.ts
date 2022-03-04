import { updateWindowSize} from "../../store/general/actionCreators";
import {ContextManager} from "../context/ContextManager";
import {store} from "../../index";
import {PlatformUtil} from "../../utils/PlatformUtil";
import {PlatformModel} from "../../staticModels/PlatformModel";
import {EventType} from "../../data/enums/EventType";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {EnvironmentUtil} from "../../utils/EnvironmentUtil";
import{ImageRepository} from "../imageRepository/ImageRepository";
import {ImageData} from "../../store/labels/types";
import { updateImageData } from "../../store/labels/actionCreators";
import { IndexedDb } from "../imageRepository/ImageRepository";
//import { updateActivePopupType } from "../../store/general/actionCreators";
// I guess I have to write here the main logic of state transition
// Read the db in the init only then dispatch its value to store. Thus here one can read ImageData[] and dispatch to store
export class AppInitializer {
    public static inti():void {
        AppInitializer.handleDB();
        AppInitializer.handleResize();
        AppInitializer.detectDeviceParams();
        AppInitializer.handleAccidentalPageExit();
        
        window.addEventListener(EventType.RESIZE, AppInitializer.handleResize);
        window.addEventListener(EventType.MOUSE_WHEEL, AppInitializer.disableGenericScrollZoom,{passive:false});
        window.addEventListener(EventType.KEY_DOWN, AppInitializer.disableUnwantedKeyBoardBehaviour);
        window.addEventListener(EventType.KEY_PRESS, AppInitializer.disableUnwantedKeyBoardBehaviour);
        ContextManager.init();
    }
/*Initially i will create one enum in general store and its corresponding actionCreator and its case in reducer to handle the action of storing the ImageData[]
Currently I think so this could be done. But I am not sure where to save the ImageData in the general store.No need to save the length actually*/
//I have done this and created one imageDataSet field in the GeneralState. Then I saw that ImageData type is cratead in labels. So this should have been done in labels
    private static handleDB = () =>{
        const indexedDB = new IndexedDb("ImageDatabase", "ImageTable");
        ImageRepository.setIndexDB(indexedDB);
        indexedDB.createObjectStore("ImageTable").then(()=>AppInitializer.getAllDBItems());
        
        //;
    }


    private static getAllDBItems = () => {
        ImageRepository.getAllSavedImageData()
        .then((imageDataSet:ImageData[])=> 
        {
            store.dispatch(updateImageData(imageDataSet))
            //ImageRepository.loadAllImageDataToMap();
        });
        // Below lines may be needed here. To avoid the Image Importer PopUp
       // store.dispatch(updateActivePopupType(null));
       // ContextManager.restoreCtx();
    };

    private static handleAccidentalPageExit = () => {
        window.onbeforeunload = (event) => {
            const projectType = GeneralSelector.getProjectType();
            console.log("Project Type at the time of App initilaization:: ", projectType);
            if (projectType != null && EnvironmentUtil.isProd()) {
                event.preventDefault();
                event.returnValue = '';
            }
        }
    };

    private static handleResize = () => {
        store.dispatch(updateWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        }));
    };

    private static disableUnwantedKeyBoardBehaviour = (event: KeyboardEvent) => {
        if (PlatformModel.isMac && event.metaKey) {
            event.preventDefault();
        }

        if (["=", "+", "-"].includes(event.key)) {
            if (event.ctrlKey || (PlatformModel.isMac && event.metaKey)) {
                event.preventDefault();
            }
        }
    };

    private static disableGenericScrollZoom = (event: MouseEvent) => {
        if (event.ctrlKey || (PlatformModel.isMac && event.metaKey)) {
            event.preventDefault();
        }
    };

    private static detectDeviceParams = () => {
        const userAgent: string = window.navigator.userAgent;
        PlatformModel.mobileDeviceData = PlatformUtil.getMobileDeviceData(userAgent);
        PlatformModel.isMac = PlatformUtil.isMac(userAgent);
        PlatformModel.isSafari = PlatformUtil.isSafari(userAgent);
        PlatformModel.isFirefox = PlatformUtil.isFirefox(userAgent);
console.log(userAgent);
console.log(PlatformModel.isFirefox);
    };
}
