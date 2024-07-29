import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {Course} from "../model/course";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import moment from 'moment';
import {fromEvent} from 'rxjs';
import {concatMap, concatMapTo, distinctUntilChanged, exhaustMap, filter, map, mergeMap, scan} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import { json } from 'body-parser';
import { saveCourse } from '../../../server/save-course.route';

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    course:Course;

    @ViewChild('saveButton', { static: true }) saveButton: ElementRef;

    @ViewChild('searchInput', { static: true }) searchInput : ElementRef;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) course:Course ) {

        this.course = course;

        this.form = fb.group({
            description: [course.description, Validators.required],
            category: [course.category, Validators.required],
            releasedAt: [moment(), Validators.required],
            longDescription: [course.longDescription,Validators.required]
        });

    }

    ngOnInit() {
        this.form.valueChanges.pipe(
           filter(()=>this.form.valid),
        //    concatMap(changes=>this.saveCourse(changes))
        mergeMap(changes=>this.saveCourse(changes))
        ).subscribe(save=>{
          this.saveCourse(save)
        })
    }

    saveCourse(changes)
    {
      return fromPromise(fetch(`/api/courses/${this.course.id}`,{
            method:'PUT',
            body:JSON.stringify(changes),
            headers:{
             'content-type':'applaction/json'
            }
         }))
    }
    ngAfterViewInit() {
        fromEvent(this.saveButton["_elementRef"].nativeElement,"click").pipe(
            // concatMap(()=>this.saveCourse(this.form.value))
            // mergeMap(_=>this.saveCourse(this.form.value))
            exhaustMap(_=>this.saveCourse(this.form.value))
        ).subscribe();
    }

    close() {
        this.dialogRef.close()
    }

  save() {

  }
}
