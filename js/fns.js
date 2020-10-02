const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const hammingText = (a, b) => hammingHex(a.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''), b.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''))

const hammingHex = (a, b) => {
	a = a.match(/.{2}/g).map(b => parseInt(b, 16).toString(2).padStart(8, '0')).join('')
	b = b.match(/.{2}/g).map(b => parseInt(b, 16).toString(2).padStart(8, '0')).join('')
	return a.split('').filter((bit, i) => Number(bit != b[i])).length
}

const hexToB64 = (hexString) => hexString.match(/.{2}/g).map(b => parseInt(b, 16).toString(2).padStart(8, '0')).join('').match(/.{6}/g).map(b => b64[parseInt(b.padStart(8, '0'), 2)]).join('')

const b64ToHex = (b64String) => Buffer.from(b64String, `base64`).toString().split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
 
const fixedXOR = (first, second) => {
	first = first.match(/.{2}/g), second = second.match(/.{2}/g)
	return first.map((b, i) => [b, second[i]].map(x => parseInt(x, 16))).map(([a, b]) => (a ^ b).toString(16)).join('')
}

const singleByteXORCipher = (encrpyted) => {
	const charFreq = { 'a': .08167, 'b': .01492, 'c': .02782, 'd': .04253, 'e': .12702, 'f': .02228, 'g': .02015, 'h': .06094, 'i': .06094, 'j': .00153, 'k': .00772, 'l': .04025, 'm': .02406, 'n': .06749, 'o': .07507, 'p': .01929, 'q': .00095, 'r': .05987, 's': .06327, 't': .09056, 'u': .02758, 'v': .00978, 'w': .02360, 'x': .00150, 'y': .01974, 'z': .00074, ' ': .13000 }
	return [...Array(256).keys()].map(key => {
		const decoded = encrpyted.match(/.{2}/g).map(b => String.fromCharCode(parseInt(b, 16) ^ key)).join('')
		return [String.fromCharCode(key), decoded, Object.entries(decoded.split('').reduce((total, letter) => {
				letter = letter.toLowerCase()
				total[letter] ? total[letter]+= 1/decoded.length : total[letter] = 1/decoded.length
				return total
			}, {})).map(([key, val]) => Math.abs((charFreq[key] || 0) - val)).reduce((a,b) => a+b, 0)]
	}).sort((a,b) => a[2] - b[2])[0]
}

const bruteforceSingleByteXOR = (ids) => ids.map((id, index) => [id, index, fns.singleByteXORCipher(id)]).sort((a,b) => a[2][2] - b[2][2])[0]

const rotatingKeyXOR = (key, plain) => {
	let count = 0
	return plain.split('').map(p => (key[count++%key.length].charCodeAt(0) ^ p.charCodeAt(0)).toString(16).padStart(2, '0')).join('')
}

const breakRotatingKeyXOR = (encrypted) => {
	const hexString = b64ToHex(encrypted)
	return [...Array(5).keys()].map(k => k+2).map(k => {
		const a = hexString.substr(0, k * 2)
		const b = hexString.substr(k * 2, k * 2)
		return [k, hammingHex(a, b) / k]
	}).sort((a,b) => a[1]-b[1]).splice(0, 5).map(([size]) => {
		const blocks = new Array(size).fill("")
		for(let i = 0; i < hexString.length; i+=2){
			blocks[i / 2 % size] += (hexString.substr(i, 2))
		}
		return (blocks.map(singleByteXORCipher).map(([k]) => k))
	})
}

module.exports = {
	hammingHex,
	hammingText,
	hexToB64,
	b64ToHex,
	fixedXOR,
	singleByteXORCipher,
	bruteforceSingleByteXOR,
	rotatingKeyXOR,
	breakRotatingKeyXOR
}