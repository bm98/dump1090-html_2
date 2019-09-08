// Derived from PolarGridHelper  amd GridHelper - (c) see authors below
// 2019 Martin Burri
// LICENSE MIT (from Three.js)
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / http://github.com/Mugen87
 * @author Hectate / http://www.github.com/Hectate
 */

//import { LineSegments } from '../objects/LineSegments.js';
//import { VertexColors } from '../constants.js';
//import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
//import { Float32BufferAttribute } from '../core/BufferAttribute.js';
//import { BufferGeometry } from '../core/BufferGeometry.js';
//import { Color } from '../math/Color.js';

/**
 * @param {Matrix4} scale the scaling matrix
 * @param {Number} radius radius of the geo circle
 * @param {Number} radials number of radials
 * @param {Number} circles number of circles (1..n)
 * @param {Number} divisions number of divisions per circle (resolution)
 * @param {Number} color1 major circles
 * @param {Number} color2 minor circles
 */

class GeoGridHelper extends THREE.LineSegments
{
    constructor( scale, radius, radials, circles, divisions, color1, color2 ) {

        // defaults..
        radius = radius || 10;
        radials = radials || 16;
        circles = circles || 8;
        divisions = divisions || 64;
        color1 = new THREE.Color( color1 !== undefined ? color1 : 0x444444 );
        color2 = new THREE.Color( color2 !== undefined ? color2 : 0x888888 );

        var vertices = [];
        var colors = [];

        var x, z;
        var v, i, j, r, color;

        // create the radials

        for ( i = 0; i <= radials; i ++ ) {

            v = ( i / radials ) * ( Math.PI * 2 );

            // gets us a NED which get us the XZ plane (in m)
            var ned = Ned.fromDistanceBearingElevation(radius, v.toDegrees(), 0);
            // scale into our scene - order is Lon, Alt, Lat
            var lPos = new THREE.Vector3(ned.east, 0, ned.north);
            lPos.applyMatrix4(scale); // scale to local
            x = lPos.x;
            z = lPos.z;

            vertices.push( 0, 0, 0 );
            vertices.push( x, 0, z );

            //color = ( i & 1 ) ? color1 : color2;
            // don't alternate radials use col 1
            color = color1;

            colors.push( color.r, color.g, color.b );
            colors.push( color.r, color.g, color.b );

        }

        // create the circles
        for ( i = 0; i <= circles; i ++ ) {

            color = ( i & 1 ) ? color1 : color2;

            r = radius - ( radius / circles * i );

            for ( j = 0; j < divisions; j ++ ) {

                // first vertex
                v = ( j / divisions ) * ( Math.PI * 2 );

                // gets us a NED which get us the XZ plane (in m)
                var ned = Ned.fromDistanceBearingElevation(r, v.toDegrees(), 0);
                // scale into our scene - order is Lon, Alt, Lat
                var lPos = new THREE.Vector3(ned.east, 0, ned.north); // Lat is z inverted
                lPos.applyMatrix4(scale); // scale to local
                x = lPos.x;
                z = lPos.z;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

                // second vertex

                v = ( ( j + 1 ) / divisions ) * ( Math.PI * 2 );
                // gets us a NED which get us the XZ plane (in m)
                ned = Ned.fromDistanceBearingElevation(r, v.toDegrees(), 0);
                // scale into our scene - order is Lon, Alt, Lat
                lPos = new THREE.Vector3(ned.east, 0, ned.north); // Lat is z inverted
                lPos.applyMatrix4(scale); // scale to local
                x = lPos.x;
                z = lPos.z;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

            }

        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
        super( geometry, material);
        //THREE.LineSegments.call( this, geometry, material );
    }
}

GeoGridHelper.prototype = Object.create( THREE.LineSegments.prototype );
//Fd3d_obj.GeoGridHelper.prototype.constructor = Fd3d_obj.GeoGridHelper;

//export { PolarGridHelper };

// ****************************************************
// Copied and adapted from
/**
 * @author mrdoob / http://mrdoob.com/
 */

//import { LineSegments } from '../objects/LineSegments.js';
//import { VertexColors } from '../constants.js';
//import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
//import { Float32BufferAttribute } from '../core/BufferAttribute.js';
//import { BufferGeometry } from '../core/BufferGeometry.js';
//import { Color } from '../math/Color.js';

class GridHelper2 extends THREE.LineSegments
{
    constructor ( sizeX, sizeZ, divisions, color1, color2 ) 
    {
        sizeX = sizeX || 10;
        sizeZ = sizeZ || 10;
        divisions = divisions || 10;
        color1 = new THREE.Color( color1 !== undefined ? color1 : 0x444444 );
        color2 = new THREE.Color( color2 !== undefined ? color2 : 0x888888 );

        let center = divisions / 2;
        let stepX = sizeX / divisions;
        let stepZ = sizeZ / divisions;
        let halfSizeX = sizeX / 2;
        let halfSizeZ = sizeZ / 2;
        let vertices = [], colors = [];

        for ( var i = 0, j = 0, kX = - halfSizeX, kZ = - halfSizeZ; i <= divisions; i ++, kX += stepX, kZ += stepZ ) {
            vertices.push( - halfSizeX, 0, kZ, halfSizeX, 0, kZ );
            vertices.push( kX, 0, - halfSizeZ, kX, 0, halfSizeZ );
            var color = i === center ? color1 : color2;
            color.toArray( colors, j ); j += 3;
            color.toArray( colors, j ); j += 3;
            color.toArray( colors, j ); j += 3;
            color.toArray( colors, j ); j += 3;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
        super( geometry, material);
//        LineSegments.call( this, geometry, material );
    }

    copy ( source )  
    {
		THREE.LineSegments.prototype.copy.call( this, source );
		this.geometry.copy( source.geometry );
		this.material.copy( source.material );
		return this;
	}

    clone ()  
    {
		return new this.constructor().copy( this );
	}


}
GridHelper2.prototype = Object.create( THREE.LineSegments.prototype );

//export { GridHelper };
