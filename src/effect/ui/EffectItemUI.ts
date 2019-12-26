class EffectItemUI extends eui.Component{
	public attrName:eui.Label;
	public slider:eui.VSlider;
	private valueLabel:eui.Label;
	/**原数据 */
	private _data;
	private _m;
	public constructor(m) {
		super();
		this._m = m;
		this.skinName = "EffectItemSkin"
	}
	protected childrenCreated(){
		super.childrenCreated();
		this.slider.addEventListener(egret.Event.CHANGE,this.onChangeData,this);
	}
	private onChangeData(){
		this._data.curNum = this.slider.value;
		this._m.refresh();
		this.refreshValue();
	}
	private refreshValue(){
		this.valueLabel.text = this.slider.value.toFixed(2) ;
	}
	private getAttrName(){
		return this._data.name;
	}
	public initData(data){
		this._data = data;
		this.attrName.text = data.name;
		this.slider.maximum = data.max;
		this.slider.minimum = data.min;
		this.slider.value = data.curNum;
		this.slider.snapInterval = 0
		this.refreshValue();
	}
	public partRemoved(){
		this.slider.removeEventListener(egret.Event.CHANGE,this.onChangeData,this);
		this._m = null;
		this._data = null;
	}
}