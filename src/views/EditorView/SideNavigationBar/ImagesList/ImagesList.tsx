import React from 'react';
import {connect} from "react-redux";
import {LabelType} from "../../../../data/enums/LabelType";
import {ISize} from "../../../../interfaces/ISize";
import {AppState} from "../../../../store";
import {ImageData, LabelPoint, LabelRect} from "../../../../store/labels/types";
import {VirtualList} from "../../../Common/VirtualList/VirtualList";
import ImagePreview from "../ImagePreview/ImagePreview";
import './ImagesList.scss';
import {ContextManager} from "../../../../logic/context/ContextManager";
import {ContextType} from "../../../../data/enums/ContextType";
import {ImageActions} from "../../../../logic/actions/ImageActions";
import {EventType} from "../../../../data/enums/EventType";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import { ImageRepository } from "../../../../logic/imageRepository/ImageRepository";
import {ImageDataUtil} from "../../../../utils/ImageDataUtil"
interface IProps {
    activeImageIndex: number;
    imagesData: ImageData[];
    activeLabelType: LabelType;
}

interface IState {
    size: ISize;
}
interface ISavedElements {
    htlmElements : HTMLImageElement [];
}

class ImagesList extends React.Component<IProps, IState> {
    private imagesListRef: HTMLDivElement;
    private savedImageData : ImageData [] = new Array();
    
    constructor(props) {
        super(props);
        console.log("~~~~~~ Image List constructed initial state:: ", this.props);
	//console.log("ImageList contructor");
    ImageRepository.getAllSavedImageData().then((imagetag:ImageData[])=> this.loadPreviousImageList(imagetag));
        this.state = {
            size: null
        }
    }

    private loadPreviousImageList(imagetag:ImageData[]){
        console.log(" ~~~~~~ loadPreviousImageList:: ", imagetag.length);
        if(imagetag.length > 1){
            this.savedImageData = imagetag;
        } 
        if(this.props.imagesData.length > 1){
            console.log(" ~~~~~~ Total length of props:: ",this.props.imagesData.length );
            this.savedImageData.concat(this.props.imagesData); // lets hope that this will work
            
        }
        /*else {          
            console.log("~~~~~~Nothing is saved currently::", this.props.imagesData);                     // May need to add few conditions here because length could vary if new images are added
            this.savedImageData = this.props.imagesData;
        }*/
    
        console.log(" ~~~~~~ Total length of savedImageData:: ",this.savedImageData.length );
        
    }

    public componentDidMount(): void {
        console.log("ImageList Component Did Mount");
        this.updateListSize();
        window.addEventListener(EventType.RESIZE, this.updateListSize);
    }

    public componentWillUnmount(): void {
        console.log("Image List component will mount");
        window.removeEventListener(EventType.RESIZE, this.updateListSize);
    }

    private updateListSize = () => {
        console.log(" ~~~~~~ Mounting the component with imageListRef:: ", this.imagesListRef);
        if (!this.imagesListRef)
            return;

        const listBoundingBox = this.imagesListRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    };

    private isImageChecked = (index:number): boolean => {
        console.log(" ~~~~~~ Object image data in isImageChecked length of saveImageData:: ", this.savedImageData.length);
        const imageData = this.savedImageData.length > 1 ? this.savedImageData[index] :this.props.imagesData[index] //this.savedImageData[index] // original  this.props.imagesData[index]
        switch (this.props.activeLabelType) {
            case LabelType.LINE:
                return imageData.labelLines.length > 0
            case LabelType.IMAGE_RECOGNITION:
                return imageData.labelNameIds.length > 0
            case LabelType.POINT:
                return imageData.labelPoints
                    .filter((labelPoint: LabelPoint) => labelPoint.status === LabelStatus.ACCEPTED)
                    .length > 0
            case LabelType.POLYGON:
                return imageData.labelPolygons.length > 0
            case LabelType.RECT:
                return imageData.labelRects
                    .filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
                    .length > 0
        }
    };

    private onClickHandler = (index: number) => {
        ImageActions.getImageByIndex(index)
    };

    private renderImagePreview = (index: number, isScrolling: boolean, isVisible: boolean, style: React.CSSProperties) => {
        console.log(" ~~~~~~ Object image data in rederImage Preview:: ", this.savedImageData[index]);
        return <ImagePreview
            key={index}
            style={style}
            size={{width: 150, height: 150}}
            isScrolling={isScrolling}
            isChecked={this.isImageChecked(index)} // original this.isImageChecked(index)
            imageData={this.savedImageData.length > 1 ? this.savedImageData[index]: this.props.imagesData[index]}//{this.props.imagesData[index]} // savedImageData  savedImageData
            onClick={() => this.onClickHandler(index)}
            isSelected={this.props.activeImageIndex === index}
           // imageElement={this.isavedImageElementes[index]}
        />
    };

    public render() {
console.log("ImgeList rendering");
console.log(" ~~~~~~ this.isavedImageElementes length: ", this.savedImageData.length);
console.log(" ~~~~~~ current state : ", this.state);
        const { size } = this.state;
        return(
            <div
                className="ImagesList"
                ref={ref => this.imagesListRef = ref}
                onClick={() => ContextManager.switchCtx(ContextType.LEFT_NAVBAR)}
            >
                {!!size && <VirtualList
                    size={size}
                    childSize={{width: 150, height: 150}}
                    childCount={this.savedImageData.length > 1 ? this.savedImageData.length : this.props.imagesData.length} //{this.props.imagesData.length}  //original: this.props.imagesData.length  savedImageData
                    childRender={this.renderImagePreview} 
                    overScanHeight={200}
                />}
            </div>
        )
    }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.labels.activeImageIndex,
    imagesData: state.labels.imagesData,
    activeLabelType: state.labels.activeLabelType
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImagesList);
