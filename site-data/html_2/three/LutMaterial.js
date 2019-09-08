
/**
 * Material LUT 
 * prepared to maintain all materials in one context
 *
 * @extends Lut
 */

class LutMaterial extends Lut
{
/**
 * 
 * @param {String} colormap Name to get colors from
 * @param {Number} numberofcolors Number of entries to create
 * @param {THREE.Material} refMaterial Material reference to create entries from
 * @returns {LutMaterial} This..
 */
    constructor( colormap, numberofcolors, refMaterial )
    {
        super( colormap, numberofcolors)

        this.materialLut = [];
        for (var i=0; i<numberofcolors; i++){
            var mx = refMaterial.clone();
            mx.setValues({  color: this.lut[i] } );
            this.materialLut.push(mx);
        }

        return this;
    }

    /**
     * 
     * @param {Number} alpha Lookup value
     */
    getMaterial( alpha ) 
    {
        // copy from getColor...
        if ( alpha <= this.minV ) {
            alpha = this.minV;
        } else if ( alpha >= this.maxV ) {
            alpha = this.maxV;
        }
        alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );
        var colorPosition = Math.round( alpha * this.n );
        colorPosition == this.n ? colorPosition -= 1 : colorPosition;
        return this.materialLut[ colorPosition ];
    }

    /**
     * Dispose all of the created materials and set material => null;
     * NOTE: this will not dispose Textures associated
     *       as they have been cloned from the reference while creating the Lut
     */
    dispose()
    {
        for (var i=0; i<this.n; i++){
            this.materialLut[i].dispose;
            this.materialLut[i] = null;
        }
    }

}
