import {result, zip} from "lodash";
import { IDBPDatabase, openDB } from 'idb';
import { ImageData, NewImageData, ImageDatav2 } from "../../store/labels/types";
import { FileUtil } from "../../utils/FileUtil";
import { ImageDataUtil } from "../../utils/ImageDataUtil";
import { string } from "@tensorflow/tfjs-core";
import { buffer, json } from "stream/consumers";

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
    private static savedImageData: ImageData [] = new Array();
    private static nFile: File;
    
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

    private static saveToDB(fileDataURL: string, oimageData: ImageData, id: string, image: HTMLImageElement){
        
        const imageDatav2:ImageDatav2 = {
            id : id,
            fileData: fileDataURL,
            filename: oimageData.fileData.name,
            fileSrc: image.src,
            fileType: oimageData.fileData.type,
            lastModified: oimageData.fileData.lastModified,
            fileSize: oimageData.fileData.size,
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
            imgloading:image.loading,
            //imgHtmlTag: JSON.stringify(image),
                        
        };	
        console.log("@@@ Reading the file from the storeImage33 using FileUtil:: ", imageDatav2);
        console.log("!! File Name ",oimageData.fileData.name );
        console.log("!! File Type ",oimageData.fileData.type );
        console.log("!! last Modified ",oimageData.fileData.lastModified );
        console.log("!! size ",oimageData.fileData.size );
        console.log("!! JSON form of the original object: ", JSON.stringify(oimageData));
        ImageRepository.indexDB.putValue("ImageTable", imageDatav2);
    }

public static storeImage33(id: string, image: HTMLImageElement, oimageData: ImageData){
	console.log("Image object:storeImage3 ", oimageData);
    console.log("!!!@@@ HTML Tag when json stringify:: ", JSON.stringify(image));
//############# conversion logic ########################
let encodedFileData : string;
FileUtil.readFileAsByte(oimageData.fileData).then((encodedData: string)=>
ImageRepository.saveToDB(encodedData, oimageData, id,image )
//encodedFileData = encodedData

);
//#######################################################


	
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

public static getById2(uuid: string): File {
       
    
	/*const runAsyncFunctions = async () => {

	let result = await ImageRepository.indexDB.getValue("ImageTable",uuid);
	
    /*const image = new Image();
	image.src = result.fileSrc;
    image.height = result.imgHeight;
	image.width = result.imgWidth;
    image.loading = result.imgloading;*/
   // const nFile = new File([result.fileData] , result.filename, {lastModified: result.lastModified, type: result.fileType});
  //  console.log("!!!@@ Getting result filetype:: ",result.fileType);
  //  console.log("!!!@@ Getting result file:: ",nFile);
    /*FileUtil.loadImage(nFile)
    .then((ele:HTMLImageElement)=> this.imgElement = ele)
    .catch((error) => this.handleLoadImageError());
    */
    //return image;
   // return nFile;
	    
//}
//return runAsyncFunctions();*/


//return this.imgElement;
/*const runAsyncFunctions = async():Promise<File> => {
    let result = await ImageRepository.indexDB.getValue("ImageTable",uuid);
    return new File([result.fileData] , result.filename, {lastModified: result.lastModified, type: result.fileType});
}
return runAsyncFunctions();*/
ImageRepository.indexDB.getValue("ImageTable", uuid)
.then((result:ImageDatav2)=>  this.nFile = new File([result.fileData] , result.filename, {lastModified: result.lastModified, type: result.fileType}));
console.log("!!!@@ Getting result file:: ",this.nFile);
return this.nFile;

}

public static getHTMLTageById2(uuid: string): Promise<HTMLImageElement> {
    const runAsyncFunctions = async (): Promise<HTMLImageElement> => {

        let result = await ImageRepository.indexDB.getValue("ImageTable",uuid);
        console.log("!!!@@ Getting result of loading image:: ",result.imgloading);
        // new Image needs to be created this time with the json from imgHTmlTag
        const image = new Image();
	    image.src = 'data:image/jpeg;base64,' + btoa(result.fileData);//Buffer.from(result.fileData,'base64');
        //image.loading = result.imgloading;
        image.height = result.imgHeight;
	    image.width = result.imgWidth;
        //image.setAttribute('crossOrigin', 'anonymous');
        return image;
    
            
    }
    
    return runAsyncFunctions();

}

public static convertImageDataToHTMLTag(imageData: ImageData):Promise<HTMLImageElement>  {

    return FileUtil.loadImage(imageData.fileData);
}

/*public static getById2(uuid: string) {
    ImageRepository.indexDB.getValue("ImageTable",uuid);

}*/

private static convertTableDataToImageData(ele: ImageDatav2):ImageData {
    const nimgData:ImageData = {
        id: ele.id,
        fileData: new File([ele.fileData] , ele.filename, {lastModified: ele.lastModified, type: ele.fileType}),
        loadStatus: ele.loadStatus,
        labelRects: ele.labelRects,
        labelPoints: ele.labelPoints,
        labelLines: ele.labelLines,
        labelPolygons: ele.labelPolygons,
        labelNameIds: ele.labelNameIds,
        isVisitedByObjectDetector: ele.isVisitedByObjectDetector,
        isVisitedByPoseDetector: ele.isVisitedByPoseDetector
    };
   return nimgData;
}


public static getAllSavedImageData() : Promise<ImageData[]> {	
	console.log("Getting all saved Images");
    const getAllSavedImageTags = async (): Promise<ImageData[]> => {
   //let result : HTMLImageElement[];
  let imageTags = await ImageRepository.indexDB.getAllValue("ImageTable");
  imageTags.forEach((imageTag)=> 
  ImageRepository.savedImageData.push(ImageRepository.convertTableDataToImageData(imageTag))
  );
  console.log("All result together: ", result);
   return ImageRepository.savedImageData;
    }
    return getAllSavedImageTags();
}


}

