declare module 'fix-webm-duration' {
  function fixWebmDuration(
    blob: Blob,
    duration: number,
    callback?: (fixedBlob: Blob) => void,
  ): Promise<Blob>;
  export default fixWebmDuration;
}
