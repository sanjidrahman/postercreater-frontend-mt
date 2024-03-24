import { Component } from '@angular/core';
import { fabric } from 'fabric';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {

  canvas: any;
  props: any = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ''
  };

  textString!: string;
  url: any | string = '';
  size: any = {
    width: 640,
    height: 800
  };

  json: any;
  textEditor: boolean = false;
  figureEditor: boolean = false;
  selected: boolean = false;
  templateUrl!: any
  commonUrl = 'http://localhost:8080/file/templates'
  v: any

  constructor() { }

  ngOnInit() {

    this.templateUrl = localStorage.getItem('selectedTemp')

    //setup front side canvas
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue'
    });

    fabric.Image.fromURL(`${this.commonUrl}/${this.templateUrl}`, (img: any) => {
      img.set({
        scaleX: this.canvas.width / img.width,
        scaleY: this.canvas.height / img.height,
        selectable: false
      });

      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
    });

    this.canvas.on({
      'object:moving': (e: any) => { },
      'object:modified': (e: any) => { },
      'selection:created': (e: any) => {

        let selectedObject = e.selected[0];
        this.v = e.selected[0];
        this.selected = true

        this.getOpacity();
        console.log(selectedObject.type);

        switch (selectedObject.type) {
          case 'rect':
          case 'circle':
          case 'triangle':
            this.figureEditor = true;
            this.getFill(selectedObject);
            break;
          case 'i-text':
            this.textEditor = true;
            this.getCharSpacing(selectedObject);
            this.getBold(selectedObject);
            this.getFontStyle(selectedObject);
            this.getFontSize(selectedObject)
            this.getFill(selectedObject);
            this.getTextDecoration(selectedObject);
            this.getFontFamily(selectedObject);
            break;
          case 'image':
            console.log('image');
            break;
        }
      },
      'selection:cleared': (e: any) => {
        this.selected = false;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

  }


  /*------------------------Block elements------------------------*/

  //Block "Add text"

  addText() {
    let textString = this.textString;
    let text = new fabric.IText(textString, {
      left: 10,
      top: 10,
      fontFamily: 'helvetica',
      fill: '#ffffff',
    });
    this.canvas.add(text);
    this.textString = '';
  }

  // Block "Add images"
  getImgPolaroid(event: any) {
    let el = event.target;
    fabric.loadSVGFromURL(el.src, (objects: any, options: any) => {
      const svg = fabric.util.groupSVGElements(objects, options);

      if (svg.width && svg.height) {
        const maxWidth = this.canvas.width * 0.3;
        const maxHeight = this.canvas.height * 0.3;
        const scaleFactorWidth = maxWidth / svg.width;
        const scaleFactorHeight = maxHeight / svg.height;
        const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);

        svg.scale(scaleFactor);
        svg.set({
          left: 10,
          top: 10
        });

        this.canvas.add(svg);
        this.canvas.renderAll();
      } else {
        console.error('SVG width or height is undefined.');
      }
    });
  }

  // Block "Upload Image"
  addImageOnCanvas(url: any) {
    if (url) {
      fabric.Image.fromURL(url, (img: any) => {
        img.scaleToWidth(100);
        img.scaleToHeight(100);
        this.canvas.add(img);
        this.canvas.renderAll();
      });
    }
  }

  readUrl(event: { target: { files: Blob[]; }; } | any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event) => {
        if (event.target)
          this.url = event.target['result'];
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  removeWhite(url: any) {
    this.url = '';
  };

  //Block "Add figure"
  addFigure(figure: any) {
    let add: any;
    switch (figure) {
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0,
          fill: '#3f51b5'
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0,
          fill: '#4caf50'
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: '#2196f3'
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          radius: 50, left: 10, top: 10, fill: '#ff5722'
        });
        break;
    }
    this.canvas.add(add);
  }

  // add canvas background image
  handleBgImageUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const imageUrl = e.target.result;
      this.addBgImageOnCanvas(imageUrl);
    };

    reader.readAsDataURL(file);
  }

  addBgImageOnCanvas(url: string) {
    fabric.Image.fromURL(url, (img: any) => {
      img.set({
        scaleX: this.canvas.width / img.width,
        scaleY: this.canvas.height / img.height,
        selectable: false
      });
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
    });
  }

  // ---

  /*Canvas*/

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  setCanvasImage() {
    let self = this;
    if (this.props.canvasImage) {
      this.canvas.setBackgroundColor({ source: this.props.canvasImage, repeat: 'repeat' }, function () {
        // self.props.canvasFill = '';
        self.canvas.renderAll();
      });
    }
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  /*------------------------Global actions for element------------------------*/

  // getActiveStyle(styleName: string, object: { [x: string]: any; getSelectionStyles: () => { (): any; new(): any;[x: string]: any; }; isEditing: any; } | null) {
  //   object = object || this.canvas.getActiveObject();
  //   if (!object) return '';

  //   return (object.getSelectionStyles() && object.isEditing)
  //     ? (object.getSelectionStyles()[styleName] || '')
  //     : (object[styleName] || '');
  // }


  // setActiveStyle(styleName: string, value: string | number, object: { setSelectionStyles: (arg0: {}) => void; isEditing: any; setCoords: () => void; set: (arg0: any, arg1: any) => void; } | null) {
  //   object = object || this.canvas.getActiveObject();
  //   if (!object) return;

  //   if (object.setSelectionStyles && object.isEditing) {

  //     var style: any = {};
  //     style[styleName] = value;
  //     object.setSelectionStyles(style);
  //     object.setCoords();
  //   }
  //   else {
  //     object.set(styleName, value);
  //   }

  //   object.setCoords();
  //   this.canvas.renderAll();
  // }


  getActiveProp(name: string) {
    var object = this.canvas.getActiveObject();
    if (!object) return '';

    return object[name] || '';
  }

  setActiveProp(name: string, value: any) {
    var object = this.canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  clone() {
    let activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'rect':
          clone = new fabric.Rect(activeObject.toObject());
          break;
        case 'circle':
          clone = new fabric.Circle(activeObject.toObject());
          break;
        case 'triangle':
          clone = new fabric.Triangle(activeObject.toObject());
          break;
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
        case 'group':
          const objects = activeObject.getObjects();
          const clonedObjects = objects.map((obj: any) => {
            return fabric.util.object.clone(obj);
          });
          clone = new fabric.Group(clonedObjects, {
            left: activeObject.left + 10,
            top: activeObject.top + 10
          });
          break;
      }
      if (clone) {
        clone.set({ left: 10, top: 10 });
        this.canvas.add(clone);
      }
    }
  }


  getOpacity() {
    const activeObject = this.canvas.getActiveObject();

    if (activeObject) {
      this.props.opacity = activeObject.opacity * 100;
    } else {
      console.error('No active object selected.');
    }
  }
  setOpacity() {
    const activeObject = this.canvas.getActiveObject();

    if (activeObject) {
      activeObject.set('opacity', this.props.opacity / 100);
      this.canvas.requestRenderAll();
    } else {
      console.error('No active object selected.');
    }
  }


  getFill(obj: any) {
    if (obj) {
      this.props.fill = obj.fill;
    }
  }
  setFill() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      switch (activeObject.type) {
        case 'i-text':
          activeObject.set('fill', this.props.fill);
          break;
        case 'rect':
        case 'circle':
        case 'triangle':
          activeObject.set('fill', this.props.fill);
          break;
        default:
          console.error('Unsupported object type:', activeObject.type);
          return;
      }
      this.canvas.renderAll();
    } else {
      console.error('No active object selected.');
    }
  }


  getCharSpacing(obj: any) {
    if (obj) {
      this.props.charSpacing = obj.charSpacing || 0;
    }
  }
  setCharSpacing() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('charSpacing', this.props.charSpacing);
      this.canvas.renderAll();
    }
  }


  getFontSize(obj: any) {
    if (obj) {
      this.props.fontSize = obj.fontSize || 0;
    }
  }
  setFontSize() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontSize', this.props.fontSize);
      this.canvas.renderAll();
    }
  }


  getBold(obj: any) {
    if (obj) {
      this.props.fontWeight = obj.fontWeight === 'bold';
    }
  }
  setBold() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontWeight', this.props.fontWeight ? 'normal' : 'bold');
      this.props.fontWeight = !this.props.fontWeight;
      this.canvas.renderAll();
    }
  }


  getFontStyle(obj: any) {
    if (obj) {
      this.props.fontStyle = obj.fontStyle === 'italic';
    }
  }
  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontStyle', this.props.fontStyle ? 'italic' : '');
      this.props.fontWeight = !this.props.fontWeight;
      this.canvas.renderAll();
    }
  }


  getTextDecoration(obj: any) {
    if (obj) {
      this.props.TextDecoration = obj.TextDecoration ? obj.TextDecoration : '';
    }
  }
  // setTextDecoration(value: string | RegExp) {
  //   console.log(value);

  //   // let iclass = this.props.TextDecoration;
  //   // if (iclass.includes(value)) {
  //   //   iclass = iclass.replace(RegExp(value, "g"), "");
  //   // } else {
  //   //   iclass += ` ${value}`
  //   // }
  //   // this.props.TextDecoration = iclass;
  //   // this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  // }
  // hasTextDecoration(value: any) {
  //   return this.props.TextDecoration.includes(value);
  // }


  getFontFamily(obj: any) {
    if (obj) {
      this.props.fontFamily = obj.fontFamily || '';
    }
  }
  setFontFamily() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set('fontFamily', this.props.fontFamily);
      this.canvas.renderAll();
    }
  }


  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.remove(activeObject);
      this.selected = false;
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();

    if (activeObject) {
      this.canvas.sendToBack(activeObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  confirmClear() {
    if (confirm('Are you sure?')) {
      this.canvas.clear();
    }
  }

  rasterize() {
    // if (!fabric.Canvas.supports('toDataURL')) {
    //   alert('This browser doesn\'t provide means to serialize canvas to an image');
    // }
    // else {
      console.log(this.canvas.toDataURL('png'))
      //window.open(this.canvas.toDataURL('png'));
      var image = new Image();
      image.src = this.canvas.toDataURL('png')
      image.crossOrigin = "anonymous";
      var w = window.open("");
      w?.document.write(image.outerHTML);
    // }

    // // Convert canvas to data URL (PNG format)
    // const dataURL = this.canvas.toDataURL('image/png');

    // // Create a temporary link element
    // const link = document.createElement('a');
    // link.href = dataURL;
    // link.download = 'canvas_image.png'; // Set the download filename

    // // Trigger a click event on the link to initiate the download
    // document.body.appendChild(link); // Append the link to the document body
    // link.click(); // Simulate a click event
    // document.body.removeChild(link); // Remove the link from the document body after download
  }

  saveCanvasToJSON() {
    let canvasJson = JSON.stringify(this.canvas);
    localStorage.setItem('Kanvas', canvasJson);
  }

  loadCanvasFromJSON() {
    let canvas = localStorage.getItem('Kanvas');

    // and load everything from the same json
    this.canvas.loadFromJSON(canvas, () => {
      this.canvas.renderAll();
    });

  };

  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  resetPanels() {
    this.textEditor = false;
    this.figureEditor = false;
  }

}

// getTextAlign() {
//   this.props.textAlign = this.getActiveProp('textAlign');
// }

// setTextAlign(value: any) {
//   console.log(value);
//   this.props.textAlign = value;
//   this.setActiveProp('textAlign', this.props.textAlign);
//   // const activeObject = this.canvas.getActiveObject();
//   // if (activeObject && activeObject.type === 'i-text') {
//   //   console.log('JI');
//   //   activeObject.set('textAlign', value).setCoords();;
//   //   this.canvas.renderAll();
//   // }
// }

// bringToFront() {
//   const activeObject = this.canvas.getActiveObject();
//   if (activeObject) {
//     this.canvas.bringToFront(activeObject);
//     this.canvas.discardActiveObject();
//     this.canvas.requestRenderAll();
//   }
// }
