class CMath {
    static radianToDegree(radian) {
        return (180 / Math.PI) * radian;
    }
    static degreeToRadian(degree) {
        return degree * (Math.PI / 180);
    }
}

export default CMath;
