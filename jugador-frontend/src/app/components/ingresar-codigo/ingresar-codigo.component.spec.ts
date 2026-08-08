import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresarCodigoComponent } from './ingresar-codigo.component';
import { Component } from '@angular/core';




describe('IngresarCodigoComponent', () => {
  let component: IngresarCodigoComponent;
  let fixture: ComponentFixture<IngresarCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngresarCodigoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngresarCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
