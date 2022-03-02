import classNames from "classnames";
import React from 'react';
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import { ImageLoadManager } from "../../../../logic/imageRepository/ImageLoadManager";
import { IRect } from "../../../../interfaces/IRect";
import { ISize } from "../../../../interfaces/ISize";
import { ImageRepository } from "../../../../logic/imageRepository/ImageRepository";
import { AppState } from "../../../../store";
import { updateImageDataById } from "../../../../store/labels/actionCreators";
import { ImageData } from "../../../../store/labels/types";
import { FileUtil } from "../../../../utils/FileUtil";
import { RectUtil } from "../../../../utils/RectUtil";
import './ImagePreview.scss';
import { CSSHelper } from "../../../../logic/helpers/CSSHelper";

interface IProps {
    imageData: ImageData;
    style: React.CSSProperties;
    size: ISize;
    isScrolling?: boolean;
    isChecked?: boolean;
    onClick?: () => any;
    isSelected?: boolean;
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    //imageElement:HTMLImageElement;
}

interface IState {
    image: HTMLImageElement;
}

class ImagePreview extends React.Component<IProps, IState> {
    private isLoading: boolean = false;

    constructor(props) {
        super(props);
        console.log("ImagePreview Constructed");
        console.log("~~!!!  Image Preive props at time of construction as set by ImageList: ", this.props);
        console.log("~~!!! Image Preive Image data at time of construction as set by ImageList: ", this.props.imageData);
        this.state = {

            image: null,
        }
    }

    public componentDidMount(): void {
    console.log(" Image Preview Component Did mount");
        ImageLoadManager.addAndRun(this.loadImage(this.props.imageData, this.props.isScrolling));
    }

    public componentWillUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): void {
        console.log("Image Preview component will Update Next:: ", nextProps);
        console.log("Image Preview component will Update Current :: ", this.props);
        if (this.props.imageData.id !== nextProps.imageData.id) {
            if (nextProps.imageData.loadStatus) {
                ImageLoadManager.addAndRun(this.loadImage(nextProps.imageData, nextProps.isScrolling));
            }
            else {
                this.setState({ image: null });
            }
        }

        if (this.props.isScrolling && !nextProps.isScrolling) {
            ImageLoadManager.addAndRun(this.loadImage(nextProps.imageData, false));
        }
    }

    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
        console.log("Image Preview should component update next:: ", nextState);
        console.log("Image Preview should component update current:: ", this.state);
        return (
            this.props.imageData.id !== nextProps.imageData.id ||
            this.state.image !== nextState.image ||
            this.props.isSelected !== nextProps.isSelected ||
            this.props.isChecked !== nextProps.isChecked
        )
    }

   private savedImage(image: HTMLImageElement){
	
            if (this.state.image !== image) {
		console.log("~~!!! Saving image in the state:: ", image);
                this.setState({ image });
            }
}

    private loadImage = async (imageData: ImageData, isScrolling: boolean) => {
        /*if(this.props.imageElement!==null){
            //this.setState({ this.props.imageElement });
            this.state = {

                image: this.props.imageElement,
            }
        }
        else */
        console.log("~~!!! Loading Image Preview:: ", imageData.fileData);
        console.log("~~!!! Load Image:: ", imageData);
        console.log("~~!!! Load Image isScrolling:: ", isScrolling);
        if (imageData.loadStatus) {
           console.log("~~!!! Calling getById2 with id: ",imageData.id);
           // below could be improved by directly converting the imageData to HTMLTag because we already stored both
           // assuming that we will always have the image data we will use another function which will convert imagedata to html Tag
            /*ImageRepository.getById2(imageData.id) 
                         .then((imageName:HTMLImageElement)=> this.savedImage(imageName));*/
            /*ImageRepository.convertImageDataToHTMLTag(imageData)
                         .then((imageName:HTMLImageElement)=> this.savedImage(imageName));*/
                  /*       ImageRepository.getById2(imageData.id)
                         .then((nFile: File)=> FileUtil.loadImage(nFile)
                         .then((imageName:HTMLImageElement)=> this.savedImage(imageName))
                         .catch((error) => this.handleLoadImageError()));*/
                         /*FileUtil.loadImage(ImageRepository.getById2(imageData.id))
                         .then((imageName:HTMLImageElement)=> this.savedImage(imageName))
                         .catch((error) => this.handleLoadImageError());*/
            ImageRepository.getHTMLTageById2(imageData.id)
                        .then((imageName:HTMLImageElement)=> this.savedImage(imageName));
	    
        }
        else if (!isScrolling || !this.isLoading) {
	    
            this.isLoading = true;
            const saveLoadedImagePartial = (image: HTMLImageElement) => this.saveLoadedImage(image, imageData);
            FileUtil.loadImage(imageData.fileData)
                .then((image: HTMLImageElement) => saveLoadedImagePartial(image))
                .catch((error) => this.handleLoadImageError())
        }
    };

    private saveLoadedImage = (image: HTMLImageElement, imageData: ImageData) => {
        console.log("~~!!! Called saveLoadedImage:: with imageDataid:: ", imageData.id);
        imageData.loadStatus = true;
        this.props.updateImageDataById(imageData.id, imageData);
        console.log("~~!!! Called saveLoadedImage:: after update::", imageData.id);
        console.log("~~!!! Called saveLoadedImage:: props id::", this.props.imageData.id);
        ImageRepository.storeImage3(imageData.id, image,imageData);
	//ImageRepository.storeImage2(imageData.id, image, imageData);
        if (imageData.id === this.props.imageData.id) {
            console.log("~~!!! calling saved state after saving new Image with id: ", imageData.id);
            console.log("~~!!! set State first time : ", image);
            this.setState({ image });
            this.isLoading = false;
        }
    };

    private getStyle = () => {
        const { size } = this.props;
        console.log("Image Preview Get Style called:: ", this.props);
        console.log("Image Preview Get Style called:: ", this.state);

        const containerRect: IRect = {
            x: 0.15 * size.width,
            y: 0.15 * size.height,
            width: 0.7 * size.width,
            height: 0.7 * size.height
        };

        const imageRect: IRect = {
            x: 0,
            y: 0,
            width: this.state.image.width,
            height: this.state.image.height
        };

        const imageRatio = RectUtil.getRatio(imageRect);
        const imagePosition: IRect = RectUtil.fitInsideRectWithRatio(containerRect, imageRatio);

        return {
            width: imagePosition.width,
            height: imagePosition.height,
            left: imagePosition.x,
            top: imagePosition.y
        }
    };

    private handleLoadImageError = () => { console.log("@###$ Error occurred")};

    private getClassName = () => {
        return classNames(
            "ImagePreview",
            {
                "selected": this.props.isSelected,
            }
        );
    };

    public render() {
    console.log("~~!!! Image Preview Render called:: state image:: ", this.state.image);
        const {
            isChecked,
            style,
            onClick
        } = this.props;

        return (
            <div
                className={this.getClassName()}
                style={style}
                onClick={onClick ? onClick : undefined}
            >
                {(!!this.state.image) ?
                    [
                        <div
                            className="Foreground"
                            key={"Foreground"}
                            style={this.getStyle()}
                        >
                            <img
                                className="Image"
                                draggable={false}
                                src={this.state.image.src}
                                alt={this.state.image.alt}
                                style={{ ...this.getStyle(), left: 0, top: 0 }}
                            />
                            {isChecked && <img
                                className="CheckBox"
                                draggable={false}
                                src={"ico/ok.png"}
                                alt={"checkbox"}
                            />}
                        </div>,
                        <div
                            className="Background"
                            key={"Background"}
                            style={this.getStyle()}
                        />
                    ] :
                    <ClipLoader
                        size={30}
                        color={CSSHelper.getLeadingColor()}
                        loading={true}
                    />}
            </div>)
    }
}

const mapDispatchToProps = {
    updateImageDataById
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImagePreview);
