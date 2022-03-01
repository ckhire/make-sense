import {result, zip} from "lodash";
import { IDBPDatabase, openDB } from 'idb';
import { ImageData, NewImageData, ImageDatav2 } from "../../store/labels/types";
import { FileUtil } from "../../utils/FileUtil";

export type ImageMap = { [s: string]: HTMLImageElement; };


export class IndexedDb {
    private database: string;
    private db: any;

    constructor(database: string, tableName: string) {
        this.database = database;
        this.createObjectStore(tableName);
console.log("Object Store is created");
    }

    public async createObjectStore(tableName: string) {
        try {
            this.db = await openDB(this.database, 1, {
                upgrade(db: IDBPDatabase) {
                  
                        if (db.objectStoreNames.contains(tableName)) {
                            console.log(" Table Name already exists:");
                        } else{
			console.log(" Table Name is getting created:");
                        db.createObjectStore(tableName, { autoIncrement: true, keyPath: 'id' });
                    }
            }}); return true;
        } catch (error) {
            return false;
        }
    }


    public async getValue(tableName: string, id: string) {
        const tx = this.db.transaction(tableName, 'readonly');
        const store = tx.objectStore(tableName);
        const result = await store.get(id);
        console.log('Get Data ', JSON.stringify(result));
        return result;
    }

    public async getAllValue(tableName: string) {
        const tx = this.db.transaction(tableName, 'readonly');
        const store = tx.objectStore(tableName);
        const result = await store.getAll();
        console.log('Get All Data', JSON.stringify(result));
        return result;
    }

    public async putValue(tableName: string, value: object) {
        const tx = this.db.transaction(tableName, 'readwrite');
        const store = tx.objectStore(tableName);
        const result = await store.put(value);
        console.log('Put Data ', JSON.stringify(result));
        return result;
    }

    public async putBulkValue(tableName: string, values: object[]) {
        const tx = this.db.transaction(tableName, 'readwrite');
        const store = tx.objectStore(tableName);
        for (const value of values) {
            const result = await store.put(value);
            console.log('Put Bulk Data ', JSON.stringify(result));
        }
        return this.getAllValue(tableName);
    }

    public async deleteValue(tableName: string, id: number) {
        const tx = this.db.transaction(tableName, 'readwrite');
        const store = tx.objectStore(tableName);
        const result = await store.get(id);
        if (!result) {
            console.log('Id not found', id);
            return result;
        }
        await store.delete(id);
        console.log('Deleted Data', id);
        return id;
    }
}


export class ImageRepository {
    private static repository: ImageMap = {};
    private static indexDB = new IndexedDb("ImageDatabase", "ImageTable");
    private static savedHTMLTags: HTMLImageElement [] = new Array();
    
    public static storeImage(id: string, image: HTMLImageElement) {
        //ImageRepository.repository[id] = image;
       console.log("id from storeImage ", id);
ImageRepository.storeImage2(id, image);
    }

    public static storeImage3(id: string, image: HTMLImageElement, oimageData: ImageData) {
        //ImageRepository.repository[id] = image;
       console.log("id from storeImage3 ", id);
ImageRepository.storeImage33(id, image, oimageData);
    }

public static storeImage33(id: string, image: HTMLImageElement, oimageData: ImageData){

	
	console.log("Image object:storeImage3 ", oimageData);
	
    

    const imageDatav2:ImageDatav2 = {
	id : id,
	fileData: "",
    filename: image.src,
    imgHeight:image.height,
    imgWidth:image.width,
    loadStatus: oimageData.loadStatus,
    labelRects: oimageData.labelRects,
    labelPoints: oimageData.labelPoints,
    labelLines: oimageData.labelLines,
    labelPolygons: oimageData.labelPolygons,
    labelNameIds: oimageData.labelNameIds,

    // SSD
    isVisitedByObjectDetector: oimageData.isVisitedByObjectDetector,

    // POSE NET
    isVisitedByPoseDetector: oimageData.isVisitedByPoseDetector,
                
};	

//############# conversion logic ########################

FileUtil.readFile(oimageData.fileData).then((encodedData: string)=>
imageDatav2.fileData = encodedData
);
//#######################################################


	ImageRepository.indexDB.putValue("ImageTable", imageDatav2);
}

public static storeImage2(id: string, image: HTMLImageElement) {
       // ImageRepository.repository[id] = image;
	
	
	console.log("Image object:storeImage2 ", image);
	
       const imageData:NewImageData = {
		id : id,
		filename : image.src,
        loadStatus: false,
	        imgHeight: image.height,
	        imgWidth: image.width,
		loading : image.loading
                
};	
	ImageRepository.indexDB.putValue("ImageTable", imageData);

	
 }

public static storeImages2(ids: string[], images: HTMLImageElement[]) {
        zip(ids, images).forEach((pair: [string, HTMLImageElement]) => {
console.log(pair);
            ImageRepository.storeImage2(...pair);

        })
    }

    public static storeImages(ids: string[], images: HTMLImageElement[]) {
        zip(ids, images).forEach((pair: [string, HTMLImageElement]) => {
            ImageRepository.storeImage2(...pair);
        })
    }

    public static getById(uuid: string): HTMLImageElement {
       
	return ImageRepository.repository[uuid];

}

public static getById2(uuid: string): Promise<HTMLImageElement> {
       

	const runAsyncFunctions = async (): Promise<HTMLImageElement> => {

	let result = await ImageRepository.indexDB.getValue("ImageTable",uuid);
	const image = new Image();
	image.src = result.filename;
    image.height = result.imgHeight;
	image.width = result.imgWidth;
    image.loading = result.loading;
    return image;

	    
}
return runAsyncFunctions();
	
}

/*public static getById2(uuid: string) {
    ImageRepository.indexDB.getValue("ImageTable",uuid);

}*/

private static convertNewImageTagToHTLMTag(ele: NewImageData):HTMLImageElement {
    const imge = new Image();
	imge.src = ele.filename;
    imge.height = ele.imgHeight;
	imge.width = ele.imgWidth;
    imge.loading = ele.loading;
    return imge;
   
}


public static getAllSavedImages() : Promise<HTMLImageElement[]> {	
	console.log("Getting all saved Images");
    const getAllSavedImageTags = async (): Promise<HTMLImageElement[]> => {
   //let result : HTMLImageElement[];
  let imageTags = await ImageRepository.indexDB.getAllValue("ImageTable");
  imageTags.forEach((imageTag)=> 
  ImageRepository.savedHTMLTags.push(ImageRepository.convertNewImageTagToHTLMTag(imageTag))
  );
  console.log("All result together: ", result);
   return ImageRepository.savedHTMLTags;
    }
    return getAllSavedImageTags();
}


}

